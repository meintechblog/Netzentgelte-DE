import { geoCircle, geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { z } from "zod";

import germanyStatesRaw from "../../../data/geo/germany-states.geo.json";
import operatorMapSeed from "../../../data/geo/operator-map-seed.json";
import type { PublishedOperator } from "../../modules/operators/current-catalog";

const operatorAnchorSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  radiusKm: z.number().positive()
});

const mapSeedEntrySchema = z.object({
  slug: z.string(),
  mapRank: z.number().int(),
  coverageKind: z.union([
    z.literal("state-zone"),
    z.literal("multi-zone"),
    z.literal("metro-zone"),
    z.literal("fallback-zone")
  ]),
  coveragePrecision: z.union([
    z.literal("exact"),
    z.literal("regional"),
    z.literal("approximate")
  ]),
  geometrySourceLabel: z.string(),
  stateHints: z.array(z.string().length(2)).default([]),
  anchors: z.array(operatorAnchorSchema).min(1)
});

const mapSeedSchema = z.array(mapSeedEntrySchema);

const parsedOperatorMapSeed = mapSeedSchema.parse(operatorMapSeed);

type GermanyStateProperties = {
  GEN: string;
  SN_L: string;
};

type GermanyStateCollection = FeatureCollection<Polygon | MultiPolygon, GermanyStateProperties>;

const germanyStateCollection = germanyStatesRaw as GermanyStateCollection;

const COUNTRY_ATTRIBUTION =
  "Kartengrundlage: GeoBasis-DE / BKG 2018, verarbeitet via germany-administrative-geojson";

const FALLBACK_ANCHORS = [
  { longitude: 7.5, latitude: 53.1, radiusKm: 40 },
  { longitude: 9.8, latitude: 52.6, radiusKm: 40 },
  { longitude: 10.6, latitude: 51.0, radiusKm: 40 },
  { longitude: 11.4, latitude: 49.7, radiusKm: 40 },
  { longitude: 8.7, latitude: 48.7, radiusKm: 40 },
  { longitude: 13.1, latitude: 51.3, radiusKm: 40 }
] as const;

export type OperatorMapAnchor = z.infer<typeof operatorAnchorSchema>;
export type OperatorMapSeedEntry = z.infer<typeof mapSeedEntrySchema>;

export type OperatorMapFeature = {
  id: string;
  operatorName: string;
  regionLabel: string;
  mapRank: number;
  coverageKind: OperatorMapSeedEntry["coverageKind"];
  geometryPrecision: OperatorMapSeedEntry["coveragePrecision"];
  geometrySourceLabel: string;
  anchors: OperatorMapAnchor[];
  stateHints: string[];
  currentBandsSummary: string;
  sourcePageUrl: string;
  documentUrl: string;
  searchMatch?: boolean;
};

export type ProjectedMapPoint = {
  x: number;
  y: number;
};

export type ProjectedGermanyState = {
  code: string;
  name: string;
  path: string;
};

export type ProjectedOperatorOverlay = {
  path: string;
  radiusKm: number;
};

export type ProjectedOperatorFeature = OperatorMapFeature & {
  projectedOverlays: ProjectedOperatorOverlay[];
  projectedFocusPoint: ProjectedMapPoint;
  highlightedStates: ProjectedGermanyState[];
  searchMatch: boolean;
};

export type ProjectedGermanyMapScene = {
  states: ProjectedGermanyState[];
  operators: ProjectedOperatorFeature[];
  attribution: string;
};

function createGermanyProjection(width: number, height: number) {
  return geoMercator()
    .fitExtent(
      [
        [48, 34],
        [width - 48, height - 48]
      ],
      germanyStateCollection
    );
}

function radiusKmToDegrees(radiusKm: number) {
  return radiusKm / 111.32;
}

function buildAnchorCircle(anchor: OperatorMapAnchor) {
  return geoCircle()
    .center([anchor.longitude, anchor.latitude])
    .radius(radiusKmToDegrees(anchor.radiusKm))();
}

function buildFallbackSeed(slug: string, index: number): OperatorMapSeedEntry {
  return {
    slug,
    mapRank: 100 + index,
    coverageKind: "fallback-zone",
    coveragePrecision: "approximate",
    geometrySourceLabel: "Automatischer Geofallback auf Deutschlandanker",
    stateHints: [],
    anchors: [FALLBACK_ANCHORS[index % FALLBACK_ANCHORS.length]]
  };
}

export function getGermanyStateCollection() {
  return germanyStateCollection;
}

export function getGermanyMapAttribution() {
  return COUNTRY_ATTRIBUTION;
}

export function getGermanyStateName(code: string) {
  return (
    germanyStateCollection.features.find((feature) => feature.properties.SN_L === code)?.properties.GEN ??
    code
  );
}

export function getOperatorMapSeed() {
  return parsedOperatorMapSeed;
}

export function getRegistryMapFeatures(operators: PublishedOperator[]): OperatorMapFeature[] {
  const seedBySlug = new Map(getOperatorMapSeed().map((entry) => [entry.slug, entry] as const));

  return operators
    .map((entry, index) => {
      const seed = seedBySlug.get(entry.slug) ?? buildFallbackSeed(entry.slug, index);

      return {
        id: entry.slug,
        operatorName: entry.name,
        regionLabel: entry.regionLabel,
        mapRank: seed.mapRank,
        coverageKind: seed.coverageKind,
        geometryPrecision: seed.coveragePrecision,
        geometrySourceLabel: seed.geometrySourceLabel,
        anchors: seed.anchors,
        stateHints: seed.stateHints,
        currentBandsSummary: entry.bands
          .map((band) => `${band.key} ${band.valueCtPerKwh} ct/kWh`)
          .join(" · "),
        sourcePageUrl: entry.sourcePageUrl,
        documentUrl: entry.documentUrl
      };
    })
    .sort((left, right) => left.mapRank - right.mapRank);
}

export function projectGermanyMap(
  features: OperatorMapFeature[],
  options?: {
    width?: number;
    height?: number;
  }
): ProjectedGermanyMapScene {
  const width = options?.width ?? 780;
  const height = options?.height ?? 960;
  const projection = createGermanyProjection(width, height);
  const pathBuilder = geoPath(projection);

  const states = germanyStateCollection.features
    .map((feature) => ({
      code: feature.properties.SN_L,
      name: feature.properties.GEN,
      path: pathBuilder(feature) ?? ""
    }))
    .filter((feature) => feature.path.length > 0);

  const statesByCode = new Map(states.map((feature) => [feature.code, feature] as const));

  const operators = features.map((feature) => {
    const primaryAnchor = feature.anchors[0];
    const projectedAnchor = projection([primaryAnchor.longitude, primaryAnchor.latitude]) ?? [
      width / 2,
      height / 2
    ];

    return {
      ...feature,
      searchMatch: feature.searchMatch ?? true,
      projectedFocusPoint: {
        x: projectedAnchor[0],
        y: projectedAnchor[1]
      },
      projectedOverlays: feature.anchors
        .map((anchor) => ({
          path: pathBuilder(buildAnchorCircle(anchor)) ?? "",
          radiusKm: anchor.radiusKm
        }))
        .filter((overlay) => overlay.path.length > 0),
      highlightedStates: feature.stateHints
        .map((code) => statesByCode.get(code))
        .filter((state): state is ProjectedGermanyState => Boolean(state))
    };
  });

  return {
    states,
    operators,
    attribution: getGermanyMapAttribution()
  };
}
