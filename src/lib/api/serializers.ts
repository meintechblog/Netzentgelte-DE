import type { IngestResult } from "../../modules/ingest/contracts";

export function serializeCurrentTariffs(result: IngestResult) {
  return {
    items: result.tariffs.map((tariff) => ({
      operatorSlug: result.operatorSlug,
      modelKey: tariff.modelKey,
      validFrom: tariff.validFrom,
      valueCentsPerKwh: tariff.valueCentsPerKwh,
      sourceUrl: tariff.sourceUrl,
      fetchedAt: result.fetchedAt
    }))
  };
}

export function serializeTariffHistory(result: IngestResult) {
  return {
    items: result.tariffs.map((tariff) => ({
      operatorSlug: result.operatorSlug,
      modelKey: tariff.modelKey,
      validFrom: tariff.validFrom,
      valueCentsPerKwh: tariff.valueCentsPerKwh,
      sourceUrl: tariff.sourceUrl,
      fetchedAt: result.fetchedAt
    }))
  };
}

export function serializeOperators(result: IngestResult) {
  return {
    items: [
      {
        slug: result.operatorSlug,
        latestFetchedAt: result.fetchedAt,
        tariffCount: result.tariffs.length
      }
    ]
  };
}

export function serializeOperatorGeo(result: IngestResult) {
  return {
    type: "FeatureCollection",
    features: result.tariffs.map((tariff, index) => ({
      type: "Feature",
      id: `${result.operatorSlug}-${index}`,
      properties: {
        operatorSlug: result.operatorSlug,
        modelKey: tariff.modelKey,
        valueCentsPerKwh: tariff.valueCentsPerKwh,
        sourceUrl: tariff.sourceUrl
      },
      geometry: null
    }))
  };
}
