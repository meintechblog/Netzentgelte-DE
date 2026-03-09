import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";
import { getRegistryMapFeatures } from "../maps/geojson";
import type { HistoricalTariff } from "../../modules/operators/history-catalog";
import type { CurrentSource } from "../../modules/sources/current-sources";
import type { OperatorShell } from "../../modules/operators/shell-catalog";

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

export function serializeOperatorShells(input: {
  items: OperatorShell[];
  summary: {
    operatorCount: number;
    verifiedCount: number;
    exactCoverageCount: number;
    sourceFoundCount: number;
  };
}) {
  return {
    summary: input.summary,
    items: input.items.map((entry) => ({
      slug: entry.slug,
      operatorName: entry.operatorName,
      legalName: entry.legalName ?? null,
      countryCode: entry.countryCode,
      websiteUrl: entry.websiteUrl,
      regionLabel: entry.regionLabel,
      shellStatus: entry.shellStatus,
      coverageStatus: entry.coverageStatus,
      sourceStatus: entry.sourceStatus,
      tariffStatus: entry.tariffStatus,
      reviewStatus: entry.reviewStatus,
      mastrId: entry.mastrId ?? null,
      sourcePageUrl: entry.sourcePageUrl ?? null,
      documentUrl: entry.documentUrl ?? null,
      notes: entry.notes ?? null,
      lastCheckedAt: entry.lastCheckedAt
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
        coverageKind: entry.coverageKind,
        geometryPrecision: entry.geometryPrecision,
        geometrySourceLabel: entry.geometrySourceLabel,
        geometrySourceUrl: entry.geometrySourceUrl ?? null,
        sourcePageUrl: entry.sourcePageUrl,
        documentUrl: entry.documentUrl,
        summary: entry.currentBandsSummary,
        mapDisplayMode: entry.mapDisplayMode ?? "anchor",
        anchor: {
          longitude: entry.anchors[0]?.longitude ?? 10.4515,
          latitude: entry.anchors[0]?.latitude ?? 51.1657
        },
        anchors: entry.anchors,
        stateHints: entry.stateHints,
        coverageUnits: entry.coverageUnits ?? []
      },
      geometry: entry.geometry ?? null
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
