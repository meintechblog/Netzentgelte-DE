import { z } from "zod";

import type { OperatorRegistryEntry } from "./registry";
import type { OperatorShellRegistryEntry } from "./shell-registry";

const vnbdigitalOperatorSchema = z.object({
  _id: z.union([z.string(), z.number()]).transform((value) => String(value)),
  name: z.string(),
  website: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  types: z.array(z.string()).nullable().optional(),
  publicRequired: z.boolean().nullable().optional(),
  layerUrl: z.string().nullable().optional(),
  bbox: z.array(z.number()).length(4).nullable().optional()
});

const vnbdigitalOperatorIndexResponseSchema = z.object({
  data: z.object({
    vnb_vnbs: z.array(vnbdigitalOperatorSchema)
  })
});

export type VnbdigitalOperator = {
  id: string;
  operatorName: string;
  websiteUrl?: string;
  postcode?: string;
  city?: string;
  address?: string;
  types: string[];
  publicRequired: boolean;
  layerUrl?: string | null;
  bbox?: [number, number, number, number] | null;
};

type BuildShellCandidatesInput = {
  vnbdigitalOperators: VnbdigitalOperator[];
  existingShells: OperatorShellRegistryEntry[];
  publishedOperators: OperatorRegistryEntry[];
};

const OPERATOR_NAME_ALIASES = new Map<string, string>([
  ["mit n mittelhessen netz", "mittelhessen-netz"],
  ["mittelhessen netz", "mittelhessen-netz"],
  ["ten thueringer energienetze", "thueringer-energienetze"],
  ["thueringer energienetze", "thueringer-energienetze"],
  ["schleswig holstein netz", "schleswig-holstein-netz"],
  ["hamburger energienetze", "stromnetz-hamburg"]
]);

export function parseVnbdigitalOperatorIndexResponse(input: unknown): VnbdigitalOperator[] {
  const parsed = vnbdigitalOperatorIndexResponseSchema.parse(input);

  return parsed.data.vnb_vnbs.map((entry) => ({
    id: entry._id,
    operatorName: normalizeWhitespace(entry.name) ?? "",
    websiteUrl: normalizeUrl(entry.website),
    postcode: normalizeWhitespace(entry.postcode),
    city: normalizeWhitespace(entry.city),
    address: normalizeWhitespace(entry.address),
    types: (entry.types ?? []).map((value) => normalizeWhitespace(value) ?? value),
    publicRequired: entry.publicRequired ?? false,
    layerUrl: normalizeUrl(entry.layerUrl) ?? null,
    bbox: (entry.bbox as [number, number, number, number] | null | undefined) ?? null
  }));
}

export function buildShellCandidatesFromVnbdigital(
  input: BuildShellCandidatesInput
): OperatorShellRegistryEntry[] {
  const normalizedOperators = input.vnbdigitalOperators.map(normalizeVnbdigitalOperator);
  const publishedBySlug = new Map(input.publishedOperators.map((entry) => [entry.slug, entry] as const));
  const publishedLookup = buildSlugLookup(
    input.publishedOperators.map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      websiteUrl: entry.websiteUrl
    }))
  );
  const shellsBySlug = new Map(input.existingShells.map((entry) => [entry.slug, entry] as const));
  const shellLookup = buildSlugLookup(
    input.existingShells.map((entry) => ({
      slug: entry.slug,
      name: entry.operatorName,
      websiteUrl: entry.websiteUrl
    }))
  );
  const matchedPublishedSlugs = new Set<string>();
  const matchedShellSlugs = new Set<string>();

  const mergedEntries = normalizedOperators.map((entry) => {
    const publishedSlug = findMatchingSlug({
      operatorName: entry.operatorName,
      websiteUrl: entry.websiteUrl,
      lookup: publishedLookup.lookup,
      knownSlugs: publishedLookup.slugs
    });

    if (publishedSlug) {
      const publishedOperator = publishedBySlug.get(publishedSlug);
      const existingShell = shellsBySlug.get(publishedSlug);

      if (!publishedOperator) {
        throw new Error(`Missing published operator for slug ${publishedSlug}.`);
      }

      matchedPublishedSlugs.add(publishedSlug);
      if (existingShell) {
        matchedShellSlugs.add(existingShell.slug);
      }

      return mergePublishedOperatorIntoShell({
        operator: entry,
        publishedOperator,
        existingShell
      });
    }

    const existingShellSlug = findMatchingSlug({
      operatorName: entry.operatorName,
      websiteUrl: entry.websiteUrl,
      lookup: shellLookup.lookup,
      knownSlugs: shellLookup.slugs
    });

    if (existingShellSlug) {
      const existingShell = shellsBySlug.get(existingShellSlug);

      if (!existingShell) {
        throw new Error(`Missing existing shell for slug ${existingShellSlug}.`);
      }

      matchedShellSlugs.add(existingShellSlug);

      return mergeExistingShell({
        operator: entry,
        existingShell
      });
    }

    return createShellFromVnbdigital(entry);
  });

  for (const shell of input.existingShells) {
    if (!matchedShellSlugs.has(shell.slug)) {
      mergedEntries.push(shell);
    }
  }

  for (const publishedOperator of input.publishedOperators) {
    if (matchedPublishedSlugs.has(publishedOperator.slug)) {
      continue;
    }

    const existingShell = shellsBySlug.get(publishedOperator.slug);
    if (existingShell) {
      matchedShellSlugs.add(existingShell.slug);
    }

    mergedEntries.push(
      mergePublishedOperatorIntoShell({
        operator: {
          id: publishedOperator.slug,
          operatorName: publishedOperator.name,
          websiteUrl: publishedOperator.websiteUrl,
          city: publishedOperator.regionLabel,
          types: [],
          publicRequired: false
        },
        publishedOperator,
        existingShell
      })
    );
  }

  return dedupeShellEntries(mergedEntries).sort((left, right) => left.slug.localeCompare(right.slug, "de"));
}

function mergePublishedOperatorIntoShell(input: {
  operator: VnbdigitalOperator;
  publishedOperator: OperatorRegistryEntry;
  existingShell?: OperatorShellRegistryEntry;
}): OperatorShellRegistryEntry {
  return {
    slug: input.publishedOperator.slug,
    operatorName: input.publishedOperator.name,
    legalName: input.existingShell?.legalName,
    websiteUrl: input.publishedOperator.websiteUrl,
    regionLabel: input.publishedOperator.regionLabel,
    shellStatus: "published",
    coverageStatus: input.existingShell?.coverageStatus ?? inferCoverageStatus(input.operator),
    sourceStatus: input.existingShell?.sourceStatus ?? inferSourceStatus(input.operator),
    tariffStatus: "verified",
    reviewStatus: input.publishedOperator.currentTariff.reviewStatus,
    mastrId: input.existingShell?.mastrId,
    sourcePageUrl:
      input.existingShell?.sourcePageUrl ?? input.publishedOperator.currentTariff.sourcePageUrl,
    documentUrl:
      input.existingShell?.documentUrl ?? input.publishedOperator.currentTariff.documentUrl,
    notes: appendVnbdigitalNote(input.existingShell?.notes, input.operator.id)
  };
}

function normalizeVnbdigitalOperator(operator: VnbdigitalOperator): VnbdigitalOperator {
  return {
    ...operator,
    operatorName: normalizeWhitespace(operator.operatorName) ?? operator.operatorName,
    websiteUrl: normalizeUrl(operator.websiteUrl),
    postcode: normalizeWhitespace(operator.postcode),
    city: normalizeWhitespace(operator.city),
    address: normalizeWhitespace(operator.address),
    layerUrl: normalizeUrl(operator.layerUrl) ?? null,
    bbox: operator.bbox ?? null,
    types: operator.types ?? []
  };
}

function mergeExistingShell(input: {
  operator: VnbdigitalOperator;
  existingShell: OperatorShellRegistryEntry;
}): OperatorShellRegistryEntry {
  return {
    ...input.existingShell,
    operatorName: input.existingShell.operatorName || input.operator.operatorName,
    websiteUrl: input.existingShell.websiteUrl ?? input.operator.websiteUrl,
    regionLabel: input.existingShell.regionLabel || buildRegionLabel(input.operator),
    coverageStatus:
      input.existingShell.coverageStatus === "unknown"
        ? inferCoverageStatus(input.operator)
        : input.existingShell.coverageStatus,
    sourceStatus:
      input.existingShell.sourceStatus === "missing"
        ? inferSourceStatus(input.operator)
        : input.existingShell.sourceStatus,
    sourcePageUrl: input.existingShell.sourcePageUrl ?? input.operator.websiteUrl,
    notes: appendVnbdigitalNote(input.existingShell.notes, input.operator.id)
  };
}

function createShellFromVnbdigital(operator: VnbdigitalOperator): OperatorShellRegistryEntry {
  return {
    slug: buildSlug(operator.operatorName, operator.id),
    operatorName: operator.operatorName,
    websiteUrl: operator.websiteUrl,
    regionLabel: buildRegionLabel(operator),
    shellStatus: "profile-found",
    coverageStatus: inferCoverageStatus(operator),
    sourceStatus: inferSourceStatus(operator),
    tariffStatus: "missing",
    reviewStatus: "pending",
    sourcePageUrl: operator.websiteUrl,
    notes: appendVnbdigitalNote(undefined, operator.id)
  };
}

function buildSlugLookup(
  entries: Array<{
    slug: string;
    name: string;
    websiteUrl?: string;
  }>
) {
  const lookup = new Map<string, string>();
  const slugs = new Set<string>();

  for (const entry of entries) {
    slugs.add(entry.slug);
    lookup.set(`name:${normalizeOperatorName(entry.name)}`, entry.slug);

    const hostname = normalizeHostname(entry.websiteUrl);
    if (hostname) {
      lookup.set(`host+name:${hostname}:${normalizeOperatorName(entry.name)}`, entry.slug);
    }
  }

  return {
    lookup,
    slugs
  };
}

function findMatchingSlug(input: {
  operatorName: string;
  websiteUrl?: string;
  lookup: Map<string, string>;
  knownSlugs: Set<string>;
}) {
  const normalizedName = normalizeOperatorName(input.operatorName);
  const hostname = normalizeHostname(input.websiteUrl);

  if (hostname) {
    const byHostAndName = input.lookup.get(`host+name:${hostname}:${normalizedName}`);
    if (byHostAndName) {
      return byHostAndName;
    }
  }

  const byName = input.lookup.get(`name:${normalizedName}`);
  if (byName) {
    return byName;
  }

  const aliasedSlug = OPERATOR_NAME_ALIASES.get(normalizedName);
  if (aliasedSlug && input.knownSlugs.has(aliasedSlug)) {
    return aliasedSlug;
  }

  return undefined;
}

function inferCoverageStatus(operator: VnbdigitalOperator): OperatorShellRegistryEntry["coverageStatus"] {
  return operator.layerUrl || operator.bbox ? "hinted" : "unknown";
}

function inferSourceStatus(operator: VnbdigitalOperator): OperatorShellRegistryEntry["sourceStatus"] {
  return operator.websiteUrl ? "candidate" : "missing";
}

function buildRegionLabel(operator: VnbdigitalOperator) {
  return operator.city ?? operator.postcode ?? "Deutschland";
}

function appendVnbdigitalNote(existing: string | undefined, id: string) {
  const note = `VNBdigital ID ${id}`;
  return existing ? `${existing} | ${note}` : note;
}

function buildSlug(operatorName: string, id: string) {
  const base = normalizeOperatorName(operatorName)
    .split(" ")
    .filter(Boolean)
    .join("-");

  return base || `netzbetreiber-${id.toLowerCase()}`;
}

function dedupeShellEntries(entries: OperatorShellRegistryEntry[]) {
  return Array.from(new Map(entries.map((entry) => [entry.slug, entry] as const)).values());
}

function normalizeOperatorName(input: string) {
  const ascii = foldToAscii(input);

  return ascii
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .filter((token) => !LEGAL_FORM_TOKENS.has(token))
    .join(" ")
    .trim();
}

function normalizeHostname(input?: string) {
  if (!input) {
    return undefined;
  }

  try {
    return new URL(input).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return undefined;
  }
}

function normalizeUrl(input: string | null | undefined) {
  const trimmed = normalizeWhitespace(input);
  return trimmed && /^https?:\/\//.test(trimmed) ? trimmed : undefined;
}

function normalizeWhitespace(input: string | null | undefined) {
  return input?.replace(/\s+/g, " ").trim() || undefined;
}

function foldToAscii(input: string) {
  return input
    .normalize("NFKD")
    .replace(/ß/g, "ss")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const LEGAL_FORM_TOKENS = new Set([
  "gmbh",
  "ag",
  "mbh",
  "kg",
  "co",
  "kgaa",
  "ohg",
  "haftungsbeschrankt"
]);
