import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";
import type { CurrentSource } from "../../modules/sources/current-sources";

export function serializeCurrentRegistryTariffs(entries: PublishedOperator[]) {
  return {
    items: entries.map((entry) => ({
      operatorSlug: entry.slug,
      operatorName: entry.name,
      modelKey: "14a-model-3",
      validFrom: entry.validFrom,
      reviewStatus: entry.reviewStatus,
      sourceSlug: entry.sourceSlug,
      checkedAt: entry.checkedAt,
      sourcePageUrl: entry.sourcePageUrl,
      documentUrl: entry.documentUrl,
      bands: entry.bands,
      timeWindows: entry.timeWindows,
      summary: summarizePublishedOperatorBands(entry)
    }))
  };
}

export function serializeRegistryTariffHistory(entries: PublishedOperator[]) {
  return {
    items: entries.map((entry) => ({
      operatorSlug: entry.slug,
      operatorName: entry.name,
      modelKey: "14a-model-3",
      validFrom: entry.validFrom,
      reviewStatus: entry.reviewStatus,
      sourceSlug: entry.sourceSlug,
      checkedAt: entry.checkedAt,
      sourcePageUrl: entry.sourcePageUrl,
      documentUrl: entry.documentUrl,
      bands: entry.bands,
      timeWindows: entry.timeWindows
    }))
  };
}

export function serializeRegistryOperators(entries: PublishedOperator[]) {
  return {
    items: entries.map((entry) => ({
      slug: entry.slug,
      name: entry.name,
      regionLabel: entry.regionLabel,
      reviewStatus: entry.reviewStatus,
      sourceDocumentCount: 1,
      latestValidFrom: entry.validFrom
    }))
  };
}

export function serializeRegistryOperatorGeo(entries: PublishedOperator[]) {
  return {
    type: "FeatureCollection",
    features: entries.map((entry) => ({
      type: "Feature",
      id: entry.slug,
      properties: {
        operatorSlug: entry.slug,
        operatorName: entry.name,
        regionLabel: entry.regionLabel,
        reviewStatus: entry.reviewStatus,
        sourcePageUrl: entry.sourcePageUrl,
        documentUrl: entry.documentUrl,
        summary: summarizePublishedOperatorBands(entry)
      },
      geometry: null
    }))
  };
}

export function serializeCurrentSources(entries: CurrentSource[]) {
  return {
    items: entries.map((entry) => ({
      sourceCatalogId: entry.sourceCatalogId,
      sourceSlug: entry.sourceSlug,
      operatorSlug: entry.operatorSlug,
      operatorName: entry.operatorName,
      pageUrl: entry.pageUrl,
      documentUrl: entry.documentUrl,
      reviewStatus: entry.reviewStatus,
      checkedAt: entry.checkedAt,
      lastSuccessfulAt: entry.lastSuccessfulAt,
      latestSnapshotFetchedAt: entry.latestSnapshotFetchedAt,
      latestSnapshotHash: entry.latestSnapshotHash,
      latestSnapshotStoragePath: entry.latestSnapshotStoragePath,
      artifactApiUrl: entry.artifactApiUrl
    }))
  };
}
