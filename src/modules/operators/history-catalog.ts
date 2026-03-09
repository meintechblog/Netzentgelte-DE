import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { getOperatorRegistry, type OperatorTimeWindow } from "./registry";

export type HistoricalTariffBand = {
  key: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  sourceQuote: string;
};

export type HistoricalTariff = {
  slug: string;
  name: string;
  regionLabel: string;
  websiteUrl: string;
  validFrom: string;
  validUntil: string | null;
  reviewStatus: "pending" | "verified";
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  latestSnapshotFetchedAt: string | null;
  latestSnapshotHash: string | null;
  latestSnapshotStoragePath: string | null;
  artifactApiUrl: string | null;
  bands: HistoricalTariffBand[];
  timeWindows: OperatorTimeWindow[];
};

export type HistoricalTariffRow = {
  operatorSlug: string;
  operatorName: string;
  regionLabel: string;
  websiteUrl: string;
  validFrom: string;
  validUntil: string | null;
  reviewStatus: "pending" | "verified";
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  latestSnapshotFetchedAt: string | null;
  latestSnapshotHash: string | null;
  latestSnapshotStoragePath: string | null;
  bandKey: "NT" | "ST" | "HT";
  bandLabel: string;
  valueCtPerKwh: string;
  sourceQuote: string;
};

const BAND_ORDER: Record<HistoricalTariffBand["key"], number> = {
  NT: 0,
  ST: 1,
  HT: 2
};

function normalizeTariffValue(valueCtPerKwh: string) {
  if (!/^-?\d+(?:\.\d+)?$/.test(valueCtPerKwh)) {
    return valueCtPerKwh;
  }

  const [integerPart, fractionalPart = ""] = valueCtPerKwh.split(".");

  if (fractionalPart.length === 0) {
    return `${integerPart}.00`;
  }

  const trimmedFraction = fractionalPart.replace(/0+$/, "");

  if (trimmedFraction.length === 0) {
    return `${integerPart}.00`;
  }

  if (trimmedFraction.length === 1) {
    return `${integerPart}.${trimmedFraction}0`;
  }

  return `${integerPart}.${trimmedFraction}`;
}

function buildArtifactApiUrl(storagePath: string | null) {
  if (!storagePath) {
    return null;
  }

  const normalizedStoragePath = storagePath.replace(/^artifacts\//, "");

  return `/api/artifacts/${normalizedStoragePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

export function getSeedHistoricalTariffs(): HistoricalTariff[] {
  return getOperatorRegistry().map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    regionLabel: entry.regionLabel,
    websiteUrl: entry.websiteUrl,
    validFrom: entry.currentTariff.validFrom,
    validUntil: null,
    reviewStatus: entry.currentTariff.reviewStatus,
    sourcePageUrl: entry.currentTariff.sourcePageUrl,
    documentUrl: entry.currentTariff.documentUrl,
    sourceSlug: `${entry.slug}-${entry.currentTariff.sourceDocumentId}`,
    checkedAt:
      entry.sourceDocuments.find((document) => document.id === entry.currentTariff.sourceDocumentId)
        ?.checkedAt ?? null,
    latestSnapshotFetchedAt: null,
    latestSnapshotHash: null,
    latestSnapshotStoragePath: null,
    artifactApiUrl: null,
    bands: [...entry.currentTariff.bands]
      .map((band) => ({
        key: band.key,
        label: band.label,
        valueCtPerKwh: band.valueCtPerKwh,
        sourceQuote: band.sourceQuote
      }))
      .sort((left, right) => BAND_ORDER[left.key] - BAND_ORDER[right.key]),
    timeWindows: entry.currentTariff.timeWindows ?? []
  }));
}

export function buildHistoricalTariffs(rows: HistoricalTariffRow[]): HistoricalTariff[] {
  const grouped = new Map<string, HistoricalTariff>();

  for (const row of rows) {
    const groupKey = [row.operatorSlug, row.validFrom, row.validUntil ?? "", row.sourceSlug].join("::");
    const existing = grouped.get(groupKey);

    if (!existing) {
      grouped.set(groupKey, {
        slug: row.operatorSlug,
        name: row.operatorName,
        regionLabel: row.regionLabel,
        websiteUrl: row.websiteUrl,
        validFrom: row.validFrom,
        validUntil: row.validUntil,
        reviewStatus: row.reviewStatus,
        sourcePageUrl: row.sourcePageUrl,
        documentUrl: row.documentUrl,
        sourceSlug: row.sourceSlug,
        checkedAt: row.checkedAt,
        latestSnapshotFetchedAt: row.latestSnapshotFetchedAt,
        latestSnapshotHash: row.latestSnapshotHash,
        latestSnapshotStoragePath: row.latestSnapshotStoragePath,
        artifactApiUrl: buildArtifactApiUrl(row.latestSnapshotStoragePath),
        bands: [
          {
            key: row.bandKey,
            label: row.bandLabel,
            valueCtPerKwh: normalizeTariffValue(row.valueCtPerKwh),
            sourceQuote: row.sourceQuote
          }
        ],
        timeWindows: []
      });
      continue;
    }

    existing.bands.push({
      key: row.bandKey,
      label: row.bandLabel,
      valueCtPerKwh: normalizeTariffValue(row.valueCtPerKwh),
      sourceQuote: row.sourceQuote
    });
  }

  const seedTimeWindowsBySlug = new Map(
    getOperatorRegistry().map((entry) => [entry.slug, entry.currentTariff.timeWindows ?? []] as const)
  );

  return [...grouped.values()].map((entry) => ({
    ...entry,
    bands: [...entry.bands].sort((left, right) => BAND_ORDER[left.key] - BAND_ORDER[right.key]),
    timeWindows: seedTimeWindowsBySlug.get(entry.slug) ?? []
  }));
}

export function shouldUseSeedHistoricalTariffs(input: {
  nodeEnv: string | undefined;
  databaseUrl: string | undefined;
}) {
  return input.nodeEnv === "test" || !input.databaseUrl;
}

export async function loadHistoricalTariffs() {
  if (
    shouldUseSeedHistoricalTariffs({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL
    })
  ) {
    return getSeedHistoricalTariffs();
  }

  const { db } = await import("../../db/client");
  const { operators, sourceCatalog, sourceSnapshots, tariffVersions } = await import("../../db/schema");

  const rows = await db
    .select({
      operatorSlug: operators.slug,
      operatorName: operators.name,
      regionLabel: sql<string>`coalesce(${operators.regionLabel}, '')`,
      websiteUrl: sql<string>`coalesce(${operators.websiteUrl}, '')`,
      validFrom: tariffVersions.validFrom,
      validUntil: sql<string | null>`to_char(${tariffVersions.validUntil}, 'YYYY-MM-DD')`,
      reviewStatus: tariffVersions.humanReviewStatus,
      sourcePageUrl: sql<string>`coalesce(${tariffVersions.sourcePageUrl}, '')`,
      documentUrl: sourceCatalog.sourceUrl,
      sourceSlug: sourceCatalog.sourceSlug,
      checkedAt: sql<string | null>`to_char(${sourceCatalog.lastCheckedAt}, 'YYYY-MM-DD')`,
      bandKey: sql<"NT" | "ST" | "HT">`${tariffVersions.bandKey}`,
      bandLabel: sql<string>`coalesce(${tariffVersions.rawLabel}, '')`,
      valueCtPerKwh: sql<string>`${tariffVersions.valueCtPerKwh}::text`,
      sourceQuote: sql<string>`coalesce(${tariffVersions.sourceQuote}, '')`
    })
    .from(tariffVersions)
    .innerJoin(operators, eq(tariffVersions.operatorId, operators.id))
    .leftJoin(sourceCatalog, eq(sourceCatalog.operatorId, operators.id))
    .where(eq(tariffVersions.modelKey, "14a-model-3"))
    .orderBy(operators.slug, desc(tariffVersions.validFrom), tariffVersions.bandKey);

  const sourceSlugs = [
    ...new Set(
      rows
        .map((row) => row.sourceSlug)
        .filter((sourceSlug): sourceSlug is string => Boolean(sourceSlug))
    )
  ];

  const snapshotRows =
    sourceSlugs.length === 0
      ? []
      : await db
          .select({
            sourceSlug: sourceCatalog.sourceSlug,
            fetchedAt: sourceSnapshots.fetchedAt,
            contentHash: sourceSnapshots.contentHash,
            storagePath: sourceSnapshots.storagePath
          })
          .from(sourceSnapshots)
          .innerJoin(sourceCatalog, eq(sourceSnapshots.sourceCatalogId, sourceCatalog.id))
          .where(
            and(inArray(sourceCatalog.sourceSlug, sourceSlugs), eq(sourceSnapshots.artifactKind, "document"))
          )
          .orderBy(sourceCatalog.sourceSlug, desc(sourceSnapshots.fetchedAt));

  const latestSnapshotBySourceSlug = new Map<
    string,
    {
      fetchedAt: string | null;
      contentHash: string | null;
      storagePath: string | null;
    }
  >();

  for (const snapshot of snapshotRows) {
    if (latestSnapshotBySourceSlug.has(snapshot.sourceSlug)) {
      continue;
    }

    latestSnapshotBySourceSlug.set(snapshot.sourceSlug, {
      fetchedAt: snapshot.fetchedAt?.toISOString() ?? null,
      contentHash: snapshot.contentHash ?? null,
      storagePath: snapshot.storagePath ?? null
    });
  }

  return buildHistoricalTariffs(
    rows
      .filter(
        (
          row
        ): row is Omit<HistoricalTariffRow, "latestSnapshotFetchedAt" | "latestSnapshotHash" | "latestSnapshotStoragePath"> => row.bandKey !== null && row.sourceSlug !== null
      )
      .map((row) => {
        const latestSnapshot = latestSnapshotBySourceSlug.get(row.sourceSlug);

        return {
          ...row,
          validUntil: row.validUntil,
          latestSnapshotFetchedAt: latestSnapshot?.fetchedAt ?? null,
          latestSnapshotHash: latestSnapshot?.contentHash ?? null,
          latestSnapshotStoragePath: latestSnapshot?.storagePath ?? null
        };
      })
  );
}
