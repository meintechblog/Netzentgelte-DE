import { getOperatorRegistry } from "./registry";

export type PublishedOperatorBand = {
  key: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  sourceQuote: string;
};

export type PublishedOperator = {
  slug: string;
  name: string;
  regionLabel: string;
  websiteUrl: string;
  validFrom: string;
  reviewStatus: "pending" | "verified";
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  bands: PublishedOperatorBand[];
};

export type PublishedOperatorRow = {
  operatorSlug: string;
  operatorName: string;
  regionLabel: string;
  websiteUrl: string;
  validFrom: string;
  reviewStatus: "pending" | "verified";
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  bandKey: "NT" | "ST" | "HT";
  bandLabel: string;
  valueCtPerKwh: string;
  sourceQuote: string;
};

const BAND_ORDER: Record<PublishedOperatorBand["key"], number> = {
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

export function getSeedPublishedOperators(): PublishedOperator[] {
  return getOperatorRegistry().map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    regionLabel: entry.regionLabel,
    websiteUrl: entry.websiteUrl,
    validFrom: entry.currentTariff.validFrom,
    reviewStatus: entry.currentTariff.reviewStatus,
    sourcePageUrl: entry.currentTariff.sourcePageUrl,
    documentUrl: entry.currentTariff.documentUrl,
    sourceSlug: `${entry.slug}-${entry.currentTariff.sourceDocumentId}`,
    checkedAt:
      entry.sourceDocuments.find((document) => document.id === entry.currentTariff.sourceDocumentId)
        ?.checkedAt ?? null,
    bands: [...entry.currentTariff.bands].sort((left, right) => BAND_ORDER[left.key] - BAND_ORDER[right.key])
  }));
}

export function buildPublishedOperators(rows: PublishedOperatorRow[]): PublishedOperator[] {
  const grouped = new Map<string, PublishedOperator>();

  for (const row of rows) {
    const existing = grouped.get(row.operatorSlug);

    if (!existing) {
      grouped.set(row.operatorSlug, {
        slug: row.operatorSlug,
        name: row.operatorName,
        regionLabel: row.regionLabel,
        websiteUrl: row.websiteUrl,
        validFrom: row.validFrom,
        reviewStatus: row.reviewStatus,
        sourcePageUrl: row.sourcePageUrl,
        documentUrl: row.documentUrl,
        sourceSlug: row.sourceSlug,
        checkedAt: row.checkedAt,
        bands: [
          {
            key: row.bandKey,
            label: row.bandLabel,
            valueCtPerKwh: normalizeTariffValue(row.valueCtPerKwh),
            sourceQuote: row.sourceQuote
          }
        ]
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

  return [...grouped.values()].map((entry) => ({
    ...entry,
    bands: [...entry.bands].sort((left, right) => BAND_ORDER[left.key] - BAND_ORDER[right.key])
  }));
}

export function summarizePublishedOperatorBands(operator: PublishedOperator) {
  return operator.bands
    .map((band) => `${band.key} ${band.valueCtPerKwh} ct/kWh`)
    .join(" · ");
}

export function shouldUseSeedPublishedOperators(input: {
  nodeEnv: string | undefined;
  databaseUrl: string | undefined;
}) {
  return input.nodeEnv === "test" || !input.databaseUrl;
}

export function getPublishedOperatorStats(operators: PublishedOperator[]) {
  const verifiedCount = operators.filter((operator) => operator.reviewStatus === "verified").length;

  return {
    operatorCount: operators.length,
    sourceDocumentCount: operators.length,
    verifiedCount
  };
}

export async function loadPublishedOperators() {
  if (
    shouldUseSeedPublishedOperators({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL
    })
  ) {
    return getSeedPublishedOperators();
  }

  const { db } = await import("../../db/client");
  const { operators, sourceCatalog, tariffVersions } = await import("../../db/schema");
  const { and, asc, eq, sql } = await import("drizzle-orm");

  const rows = await db
    .select({
      operatorSlug: operators.slug,
      operatorName: operators.name,
      regionLabel: sql<string>`coalesce(${operators.regionLabel}, '')`,
      websiteUrl: sql<string>`coalesce(${operators.websiteUrl}, '')`,
      validFrom: tariffVersions.validFrom,
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
    .where(and(eq(tariffVersions.modelKey, "14a-model-3")))
    .orderBy(asc(operators.slug), asc(tariffVersions.validFrom), asc(tariffVersions.bandKey));

  return buildPublishedOperators(rows.filter((row) => row.bandKey !== null) as PublishedOperatorRow[]);
}
