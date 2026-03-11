import type { OperatorRegistryEntry } from "./registry";

type RegistryOperatorRow = {
  slug: string;
  name: string;
  countryCode: "DE";
  regionLabel: string;
  websiteUrl: string;
};

type RegistrySourceRow = {
  operatorSlug: string;
  sourceSlug: string;
  pageUrl: string;
  sourceUrl: string;
  documentType: "pdf" | "html" | "csv" | "json" | "xlsx";
  providerHint: string;
  updateStrategy: string;
  refreshWindowDays: number;
  parserMode: string;
  reviewStatus: "pending" | "verified";
  notes: string;
  lastCheckedAt: string;
};

type RegistryTariffRow = {
  operatorSlug: string;
  sourceSlug: string;
  modelKey: "14a-model-3";
  bandKey: "NT" | "ST" | "HT";
  validFrom: string;
  rawLabel: string;
  rawValue: string;
  sourcePageUrl: string;
  sourceQuote: string;
  humanReviewStatus: "pending" | "verified";
  valueCtPerKwh: string;
};

export type RegistryImportPayload = {
  operators: RegistryOperatorRow[];
  sources: RegistrySourceRow[];
  tariffs: RegistryTariffRow[];
};

const UPDATE_STRATEGY = "quarterly-review";
const REFRESH_WINDOW_DAYS = 90;

export function buildRegistryImportPayload(registry: OperatorRegistryEntry[]): RegistryImportPayload {
  const operators = registry.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    countryCode: "DE" as const,
    regionLabel: entry.regionLabel,
    websiteUrl: entry.websiteUrl
  }));

  const sources = registry.map((entry) => {
    const sourceDocument = entry.sourceDocuments.find(
      (document) => document.id === entry.currentTariff.sourceDocumentId
    );

    if (!sourceDocument) {
      throw new Error(`Missing source document for ${entry.slug}.`);
    }

    return {
      operatorSlug: entry.slug,
      sourceSlug: buildSourceSlug(entry.slug, sourceDocument.id),
      pageUrl: sourceDocument.sourcePageUrl,
      sourceUrl: sourceDocument.documentUrl,
      documentType: sourceDocument.documentType,
      providerHint: new URL(sourceDocument.documentUrl).hostname.replace(/^www\./, ""),
      updateStrategy: UPDATE_STRATEGY,
      refreshWindowDays: REFRESH_WINDOW_DAYS,
      parserMode: "curated-registry",
      reviewStatus: sourceDocument.reviewStatus,
      notes: [`sourcePageUrl=${sourceDocument.sourcePageUrl}`, ...sourceDocument.notes].join("\n"),
      lastCheckedAt: sourceDocument.checkedAt
    };
  });

  const tariffs = registry.flatMap((entry) => {
    const sourceSlug = buildSourceSlug(entry.slug, entry.currentTariff.sourceDocumentId);

    return entry.currentTariff.bands.map((band) => ({
      operatorSlug: entry.slug,
      sourceSlug,
      modelKey: entry.currentTariff.modelKey,
      bandKey: band.key,
      validFrom: entry.currentTariff.validFrom,
      rawLabel: band.label,
      rawValue: band.valueCtPerKwh,
      sourcePageUrl: entry.currentTariff.sourcePageUrl,
      sourceQuote: band.sourceQuote,
      humanReviewStatus: entry.currentTariff.reviewStatus,
      valueCtPerKwh: band.valueCtPerKwh
    }));
  });

  return {
    operators,
    sources,
    tariffs
  };
}

export function summarizeRegistryImport(payload: RegistryImportPayload) {
  return {
    operatorCount: payload.operators.length,
    sourceCount: payload.sources.length,
    tariffCount: payload.tariffs.length
  };
}

function buildSourceSlug(operatorSlug: string, sourceDocumentId: string) {
  return `${operatorSlug}-${sourceDocumentId}`;
}
