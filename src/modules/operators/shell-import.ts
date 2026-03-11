import type { OperatorShellRegistryEntry } from "./shell-registry";

export type ShellImportRow = {
  slug: string;
  operatorName: string;
  legalName: string | null;
  countryCode: "DE";
  websiteUrl: string | null;
  regionLabel: string;
  shellStatus: OperatorShellRegistryEntry["shellStatus"];
  coverageStatus: OperatorShellRegistryEntry["coverageStatus"];
  sourceStatus: OperatorShellRegistryEntry["sourceStatus"];
  tariffStatus: OperatorShellRegistryEntry["tariffStatus"];
  reviewStatus: OperatorShellRegistryEntry["reviewStatus"];
  registryFeedSource: string | null;
  registryFeedLabel: string | null;
  lastSeenInRegistryFeed: string | null;
  deprecatedStatus: OperatorShellRegistryEntry["deprecatedStatus"];
  deprecatedCheckedAt: string | null;
  deprecatedReason: string | null;
  mastrId: string | null;
  sourcePageUrl: string | null;
  documentUrl: string | null;
  notes: string | null;
  lastCheckedAt: string | null;
};

export type ShellImportPayload = {
  shells: ShellImportRow[];
};

export function buildShellImportPayload(entries: OperatorShellRegistryEntry[]): ShellImportPayload {
  return {
    shells: entries.map((entry) => ({
      slug: entry.slug,
      operatorName: entry.operatorName,
      legalName: entry.legalName ?? null,
      countryCode: "DE",
      websiteUrl: entry.websiteUrl ?? null,
      regionLabel: entry.regionLabel,
      shellStatus: entry.shellStatus,
      coverageStatus: entry.coverageStatus,
      sourceStatus: entry.sourceStatus,
      tariffStatus: entry.tariffStatus,
      reviewStatus: entry.reviewStatus,
      registryFeedSource: entry.registryFeedSource ?? null,
      registryFeedLabel: entry.registryFeedLabel ?? null,
      lastSeenInRegistryFeed: entry.lastSeenInRegistryFeed ?? null,
      deprecatedStatus: entry.deprecatedStatus,
      deprecatedCheckedAt: entry.deprecatedCheckedAt ?? null,
      deprecatedReason: entry.deprecatedReason ?? null,
      mastrId: entry.mastrId ?? null,
      sourcePageUrl: entry.sourcePageUrl ?? null,
      documentUrl: entry.documentUrl ?? null,
      notes: entry.notes ?? null,
      lastCheckedAt: null
    }))
  };
}

export function summarizeShellImport(payload: ShellImportPayload) {
  return {
    operatorCount: payload.shells.length,
    verifiedCount: payload.shells.filter((entry) => entry.reviewStatus === "verified").length,
    exactCoverageCount: payload.shells.filter((entry) => entry.coverageStatus === "exact").length,
    sourceFoundCount: payload.shells.filter((entry) => entry.sourceStatus !== "missing").length
  };
}
