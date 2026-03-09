import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";
import { getRegistryMapFeatures } from "../maps/geojson";
import type { HistoricalTariff } from "../../modules/operators/history-catalog";
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

export function serializeRegistryTariffHistory(entries: HistoricalTariff[]) {
  return {
    items: entries.map((entry) => ({
      operatorSlug: entry.slug,
      operatorName: entry.name,
      modelKey: "14a-model-3",
      validFrom: entry.validFrom,
      validUntil: entry.validUntil,
      reviewStatus: entry.reviewStatus,
      sourceSlug: entry.sourceSlug,
      checkedAt: entry.checkedAt,
      latestSnapshotFetchedAt: entry.latestSnapshotFetchedAt,
      latestSnapshotHash: entry.latestSnapshotHash,
      latestSnapshotStoragePath: entry.latestSnapshotStoragePath,
      artifactApiUrl: entry.artifactApiUrl,
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
  const features = getRegistryMapFeatures(entries);

  return {
    type: "FeatureCollection",
    features: features.map((entry) => ({
      type: "Feature",
      id: entry.id,
      properties: {
        operatorSlug: entry.id,
        operatorName: entry.operatorName,
        regionLabel: entry.regionLabel,
        mapLabel: entry.mapLabel,
        coverageType: entry.coverageType,
        geometryPrecision: entry.geometryPrecision,
        geometrySourceLabel: entry.geometrySourceLabel,
        sourcePageUrl: entry.sourcePageUrl,
        documentUrl: entry.documentUrl,
        summary: entry.currentBandsSummary,
        svgPath: entry.geometry.path,
        centroid: entry.centroid,
        labelAnchor: entry.labelAnchor
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
      latestPageSnapshotFetchedAt: entry.latestPageSnapshotFetchedAt,
      latestPageSnapshotHash: entry.latestPageSnapshotHash,
      latestPageSnapshotStoragePath: entry.latestPageSnapshotStoragePath,
      pageArtifactApiUrl: entry.pageArtifactApiUrl,
      latestDocumentSnapshotFetchedAt: entry.latestDocumentSnapshotFetchedAt,
      latestDocumentSnapshotHash: entry.latestDocumentSnapshotHash,
      latestDocumentSnapshotStoragePath: entry.latestDocumentSnapshotStoragePath,
      documentArtifactApiUrl: entry.documentArtifactApiUrl
    }))
  };
}
