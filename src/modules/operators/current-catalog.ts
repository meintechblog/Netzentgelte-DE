import { getOperatorRegistry, type OperatorTimeWindow } from "./registry";
import {
  filterPublishableOperators,
  getPublicationIntegrityReports,
  type PublicationIntegrityReport
} from "./publication-integrity";
import { normalizePriceValueToNet, type PriceBasis } from "./price-basis";
import { isExcludedTransmissionOperator } from "./operator-exclusions";
import {
  evaluateModul3Compliance,
  type ComplianceEvaluation
} from "../compliance/modul-3-evaluator";
import { getActiveModul3RuleSet } from "../compliance/rule-catalog";

export type PublishedOperatorBand = {
  key: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  sourceQuote: string;
  priceBasis: PriceBasis;
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
  priceBasis: PriceBasis;
  bands: PublishedOperatorBand[];
  timeWindows: OperatorTimeWindow[];
  compliance: ComplianceEvaluation;
};

export type PublishedOperatorSnapshot = {
  operators: PublishedOperator[];
  integrityReports: PublicationIntegrityReport[];
  totalOperatorCount: number;
  withheldCount: number;
};

type PublishedOperatorBase = Omit<PublishedOperator, "compliance">;

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
  priceBasis?: PriceBasis;
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

function normalizeStoredTariffValue(valueCtPerKwh: string, priceBasis: PriceBasis) {
  return normalizeTariffValue(normalizePriceValueToNet(valueCtPerKwh, priceBasis));
}

function getDefaultPriceBasis(): PriceBasis {
  return "assumed-netto";
}

export function getSeedPublishedOperators(): PublishedOperator[] {
  return buildPublishedOperatorSnapshot(getSeedOperatorBase()).operators;
}

export function buildPublishedOperatorSnapshot(operators: PublishedOperatorBase[]): PublishedOperatorSnapshot {
  const ruleSet = getActiveModul3RuleSet();
  const evaluatedOperators: PublishedOperator[] = operators.map((operator) => ({
    ...operator,
    compliance: evaluateModul3Compliance({
      operatorSlug: operator.slug,
      operatorName: operator.name,
      bands: operator.bands,
      timeWindows: operator.timeWindows,
      ruleSet
    })
  }));
  const distributionOperators = evaluatedOperators.filter(
    (operator) =>
      !isExcludedTransmissionOperator({
        slug: operator.slug,
        name: operator.name,
        websiteUrl: operator.websiteUrl,
        sourcePageUrl: operator.sourcePageUrl
      })
  );
  const integrityReports = getPublicationIntegrityReports(distributionOperators);
  const publishableOperators = filterPublishableOperators(distributionOperators);

  return {
    operators: publishableOperators,
    integrityReports,
    totalOperatorCount: distributionOperators.length,
    withheldCount: distributionOperators.length - publishableOperators.length
  };
}

export function getPublishedOperatorSnapshotStats(snapshot: PublishedOperatorSnapshot) {
  const verifiedCount = snapshot.operators.filter(
    (operator) => operator.reviewStatus === "verified"
  ).length;

  return {
    operatorCount: snapshot.operators.length,
    sourceDocumentCount: snapshot.operators.length,
    verifiedCount,
    totalOperatorCount: snapshot.totalOperatorCount,
    withheldCount: snapshot.withheldCount
  };
}

function getSeedOperatorBase(): PublishedOperatorBase[] {
  const defaultPriceBasis = getDefaultPriceBasis();

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
    priceBasis: defaultPriceBasis,
    bands: [...entry.currentTariff.bands]
      .map((band) => ({
        ...band,
        priceBasis: defaultPriceBasis,
        valueCtPerKwh: normalizeStoredTariffValue(band.valueCtPerKwh, defaultPriceBasis)
      }))
      .sort((left, right) => BAND_ORDER[left.key] - BAND_ORDER[right.key]),
    timeWindows: entry.currentTariff.timeWindows ?? []
  }));
}

export function buildPublishedOperators(rows: PublishedOperatorRow[]): PublishedOperatorBase[] {
  const latestValidFromByOperator = new Map<string, string>();

  for (const row of rows) {
    const currentLatest = latestValidFromByOperator.get(row.operatorSlug);

    if (!currentLatest || row.validFrom > currentLatest) {
      latestValidFromByOperator.set(row.operatorSlug, row.validFrom);
    }
  }

  const grouped = new Map<string, PublishedOperatorBase>();

  for (const row of rows) {
    if (latestValidFromByOperator.get(row.operatorSlug) !== row.validFrom) {
      continue;
    }

    const rowPriceBasis = row.priceBasis ?? getDefaultPriceBasis();
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
        priceBasis: rowPriceBasis,
        timeWindows: [],
        bands: [
          {
            key: row.bandKey,
            label: row.bandLabel,
            valueCtPerKwh: normalizeTariffValue(row.valueCtPerKwh),
            sourceQuote: row.sourceQuote,
            priceBasis: rowPriceBasis
          }
        ]
      });
      continue;
    }

    existing.bands.push({
      key: row.bandKey,
      label: row.bandLabel,
      valueCtPerKwh: normalizeTariffValue(row.valueCtPerKwh),
      sourceQuote: row.sourceQuote,
      priceBasis: rowPriceBasis
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

export async function loadPublishedOperators() {
  return (await loadPublishedOperatorSnapshot()).operators;
}

export async function loadPublishedOperatorSnapshot() {
  if (
    shouldUseSeedPublishedOperators({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL
    })
  ) {
    return buildPublishedOperatorSnapshot(getSeedOperatorBase());
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
      sourceQuote: sql<string>`coalesce(${tariffVersions.sourceQuote}, '')`,
      priceBasis: sql<PriceBasis>`'assumed-netto'`
    })
    .from(tariffVersions)
    .innerJoin(operators, eq(tariffVersions.operatorId, operators.id))
    .leftJoin(sourceCatalog, eq(sourceCatalog.operatorId, operators.id))
    .where(and(eq(tariffVersions.modelKey, "14a-model-3")))
    .orderBy(asc(operators.slug), asc(tariffVersions.validFrom), asc(tariffVersions.bandKey));

  const seedTimeWindowsBySlug = new Map(
    getOperatorRegistry().map((entry) => [entry.slug, entry.currentTariff.timeWindows ?? []] as const)
  );

  return buildPublishedOperatorSnapshot(
    buildPublishedOperators(rows.filter((row) => row.bandKey !== null) as PublishedOperatorRow[]).map(
      (entry) => ({
        ...entry,
        timeWindows: seedTimeWindowsBySlug.get(entry.slug) ?? []
      })
    )
  );
}
