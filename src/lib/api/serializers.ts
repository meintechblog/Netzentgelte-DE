import { formatBandSummary, type OperatorRegistryEntry } from "../../modules/operators/registry";

export function serializeCurrentRegistryTariffs(entries: OperatorRegistryEntry[]) {
  return {
    items: entries.map((entry) => ({
      operatorSlug: entry.slug,
      operatorName: entry.name,
      modelKey: entry.currentTariff.modelKey,
      validFrom: entry.currentTariff.validFrom,
      reviewStatus: entry.currentTariff.reviewStatus,
      sourcePageUrl: entry.currentTariff.sourcePageUrl,
      documentUrl: entry.currentTariff.documentUrl,
      bands: entry.currentTariff.bands,
      summary: formatBandSummary(entry)
    }))
  };
}

export function serializeRegistryTariffHistory(entries: OperatorRegistryEntry[]) {
  return {
    items: entries.map((entry) => ({
      operatorSlug: entry.slug,
      operatorName: entry.name,
      modelKey: entry.currentTariff.modelKey,
      validFrom: entry.currentTariff.validFrom,
      reviewStatus: entry.currentTariff.reviewStatus,
      sourcePageUrl: entry.currentTariff.sourcePageUrl,
      documentUrl: entry.currentTariff.documentUrl,
      bands: entry.currentTariff.bands
    }))
  };
}

export function serializeRegistryOperators(entries: OperatorRegistryEntry[]) {
  return {
    items: entries.map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      regionLabel: entry.regionLabel,
      reviewStatus: entry.currentTariff.reviewStatus,
      sourceDocumentCount: entry.sourceDocuments.length,
      latestValidFrom: entry.currentTariff.validFrom
    }))
  };
}

export function serializeRegistryOperatorGeo(entries: OperatorRegistryEntry[]) {
  return {
    type: "FeatureCollection",
    features: entries.map((entry) => ({
      type: "Feature",
      id: entry.slug,
      properties: {
        operatorSlug: entry.slug,
        operatorName: entry.name,
        regionLabel: entry.regionLabel,
        reviewStatus: entry.currentTariff.reviewStatus,
        sourcePageUrl: entry.currentTariff.sourcePageUrl,
        documentUrl: entry.currentTariff.documentUrl,
        summary: formatBandSummary(entry)
      },
      geometry: null
    }))
  };
}
