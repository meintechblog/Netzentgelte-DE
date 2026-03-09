import { geoCircle, geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { z } from "zod";

import municipalitiesRaw from "../../../data/geo/bkg-selected-municipalities.geo.json";
import germanyStatesRaw from "../../../data/geo/germany-states.geo.json";
import operatorCoverageSeed from "../../../data/geo/operator-coverage-seed.json";
import operatorMapSeed from "../../../data/geo/operator-map-seed.json";
import type { PublishedOperator } from "../../modules/operators/current-catalog";

const operatorAnchorSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  radiusKm: z.number().positive()
});

const operatorCoverageUnitSchema = z.object({
  ags: z.string().length(8),
  name: z.string(),
  kind: z.string()
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

const coverageSeedEntrySchema = z.object({
  slug: z.string(),
  mapRank: z.number().int(),
  coverageKind: z.literal("municipality-union"),
  coveragePrecision: z.literal("exact"),
  geometrySourceLabel: z.string(),
  geometrySourceUrl: z.string().url(),
  stateHints: z.array(z.string().length(2)).default([]),
  coverageUnits: z.array(operatorCoverageUnitSchema).min(1)
});

const mapSeedSchema = z.array(mapSeedEntrySchema);
const coverageSeedSchema = z.array(coverageSeedEntrySchema);

const parsedOperatorMapSeed = mapSeedSchema.parse(operatorMapSeed);
const parsedOperatorCoverageSeed = coverageSeedSchema.parse(operatorCoverageSeed);

type GermanyStateProperties = {
  GEN: string;
  SN_L: string;
};

type MunicipalityProperties = {
  AGS: string;
  GEN: string;
  BEZ: string;
  SN_L: string;
  SN_K: string;
};

type GermanyStateCollection = FeatureCollection<Polygon | MultiPolygon, GermanyStateProperties>;
type MunicipalityCollection = FeatureCollection<Polygon | MultiPolygon, MunicipalityProperties>;

const germanyStateCollection = germanyStatesRaw as GermanyStateCollection;
const municipalityCollection = municipalitiesRaw as MunicipalityCollection;

const COUNTRY_ATTRIBUTION =
  "Kartengrundlage: GeoBasis-DE / BKG VG250 Gemeindegrenzen 2022 und Landesgrenzen 2018";

const FALLBACK_ANCHORS = [
  { longitude: 7.5, latitude: 53.1, radiusKm: 40 },
  { longitude: 9.8, latitude: 52.6, radiusKm: 40 },
  { longitude: 10.6, latitude: 51.0, radiusKm: 40 },
  { longitude: 11.4, latitude: 49.7, radiusKm: 40 },
  { longitude: 8.7, latitude: 48.7, radiusKm: 40 },
  { longitude: 13.1, latitude: 51.3, radiusKm: 40 }
] as const;

const municipalityFeaturesByAgs = new Map(
  municipalityCollection.features.map((feature) => [feature.properties.AGS, feature] as const)
);

validateCoverageSeed(parsedOperatorCoverageSeed);

export type OperatorMapAnchor = z.infer<typeof operatorAnchorSchema>;
export type OperatorCoverageUnit = z.infer<typeof operatorCoverageUnitSchema>;
export type OperatorMapSeedEntry = z.infer<typeof mapSeedEntrySchema>;
export type OperatorCoverageSeedEntry = z.infer<typeof coverageSeedEntrySchema>;
export type OperatorMapDisplayMode = "polygon" | "anchor" | "hidden";

export type OperatorMapFeature = {
  id: string;
  operatorName: string;
  regionLabel: string;
  mapRank: number;
  coverageKind: OperatorMapSeedEntry["coverageKind"] | OperatorCoverageSeedEntry["coverageKind"];
  geometryPrecision:
    | OperatorMapSeedEntry["coveragePrecision"]
    | OperatorCoverageSeedEntry["coveragePrecision"];
  geometrySourceLabel: string;
  geometrySourceUrl?: string | null;
  anchors: OperatorMapAnchor[];
  stateHints: string[];
  coverageUnits?: OperatorCoverageUnit[];
  geometry?: Polygon | MultiPolygon | null;
  mapDisplayMode?: OperatorMapDisplayMode;
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
  projectedGeometryPath: string | null;
  projectedOverlays: ProjectedOperatorOverlay[];
  projectedFocusPoint: ProjectedMapPoint;
  highlightedStates: ProjectedGermanyState[];
  searchMatch: boolean;
  mapDisplayMode: OperatorMapDisplayMode;
  coverageUnitCount: number;
};

export type ProjectedGermanyMapScene = {
  states: ProjectedGermanyState[];
  operators: ProjectedOperatorFeature[];
  attribution: string;
  mappedOperatorCount: number;
  hiddenOperatorCount: number;
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

function toMultiPolygonCoordinates(geometry: Polygon | MultiPolygon) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

function getSignedRingArea(ring: number[][]) {
  let area = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index] ?? [0, 0];
    const [x2, y2] = ring[index + 1] ?? [0, 0];

    area += x1 * y2 - x2 * y1;
  }

  return area / 2;
}

function normalizeRingOrientation(ring: number[][], clockwise: boolean) {
  const isClockwise = getSignedRingArea(ring) < 0;

  return isClockwise === clockwise ? ring : [...ring].reverse();
}

function rewindGeometryForProjection(
  geometry: Polygon | MultiPolygon,
  options?: {
    outerClockwise?: boolean;
  }
): Polygon | MultiPolygon {
  const outerClockwise = options?.outerClockwise ?? true;
  const normalizePolygon = (polygon: number[][][]) =>
    polygon.map((ring, index) =>
      normalizeRingOrientation(ring, index === 0 ? outerClockwise : !outerClockwise)
    );

  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: normalizePolygon(geometry.coordinates as number[][][])
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map((polygon) => normalizePolygon(polygon as number[][][]))
  };
}

function scoreProjectedBounds(
  bounds: [[number, number], [number, number]],
  width: number,
  height: number
) {
  const [[x0, y0], [x1, y1]] = bounds;
  const overflow =
    Math.max(0, -x0) +
    Math.max(0, -y0) +
    Math.max(0, x1 - width) +
    Math.max(0, y1 - height);
  const boundedWidth = Math.max(0, x1 - x0);
  const boundedHeight = Math.max(0, y1 - y0);

  return overflow * 1_000 + boundedWidth * boundedHeight;
}

function normalizeGeometryForProjection(
  geometry: Polygon | MultiPolygon,
  pathBuilder: ReturnType<typeof geoPath>,
  width: number,
  height: number
) {
  const candidates = [geometry, rewindGeometryForProjection(geometry)];
  let bestCandidate = candidates[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const bounds = pathBuilder.bounds({
      type: "Feature",
      geometry: candidate,
      properties: {}
    });

    const score = scoreProjectedBounds(bounds, width, height);

    if (score < bestScore) {
      bestCandidate = candidate;
      bestScore = score;
    }
  }

  return bestCandidate;
}

function combineCoverageGeometry(coverageUnits: OperatorCoverageUnit[]) {
  const geometries = coverageUnits
    .map((unit) => municipalityFeaturesByAgs.get(unit.ags)?.geometry ?? null)
    .filter((geometry): geometry is Polygon | MultiPolygon => Boolean(geometry));

  if (geometries.length === 0) {
    return null;
  }

  if (geometries.length === 1) {
    return geometries[0] ?? null;
  }

  return {
    type: "MultiPolygon" as const,
    coordinates: geometries.flatMap(toMultiPolygonCoordinates)
  };
}

function validateCoverageSeed(seed: OperatorCoverageSeedEntry[]) {
  const seenCoverageUnits = new Map<string, string>();

  for (const entry of seed) {
    for (const unit of entry.coverageUnits) {
      const existing = seenCoverageUnits.get(unit.ags);

      if (existing) {
        throw new Error(
          `Coverage unit ${unit.ags} is assigned to both ${existing} and ${entry.slug}.`
        );
      }

      if (!municipalityFeaturesByAgs.has(unit.ags)) {
        throw new Error(`Coverage unit ${unit.ags} for ${entry.slug} is missing in the BKG municipality slice.`);
      }

      seenCoverageUnits.set(unit.ags, entry.slug);
    }
  }
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

export function getOperatorCoverageSeed() {
  return parsedOperatorCoverageSeed;
}

export function getSelectedMunicipalityCollection() {
  return municipalityCollection;
}

export function getRegistryMapFeatures(operators: PublishedOperator[]): OperatorMapFeature[] {
  const seedBySlug = new Map(getOperatorMapSeed().map((entry) => [entry.slug, entry] as const));
  const coverageSeedBySlug = new Map(
    getOperatorCoverageSeed().map((entry) => [entry.slug, entry] as const)
  );

  return operators
    .map((entry, index) => {
      const coverageSeed = coverageSeedBySlug.get(entry.slug);

      if (coverageSeed) {
        return {
          id: entry.slug,
          operatorName: entry.name,
          regionLabel: entry.regionLabel,
          mapRank: coverageSeed.mapRank,
          coverageKind: coverageSeed.coverageKind,
          geometryPrecision: coverageSeed.coveragePrecision,
          geometrySourceLabel: coverageSeed.geometrySourceLabel,
          geometrySourceUrl: coverageSeed.geometrySourceUrl,
          anchors: [],
          stateHints: coverageSeed.stateHints,
          coverageUnits: coverageSeed.coverageUnits,
          geometry: combineCoverageGeometry(coverageSeed.coverageUnits),
          mapDisplayMode: "polygon" as const,
          currentBandsSummary: entry.bands
            .map((band) => `${band.key} ${band.valueCtPerKwh} ct/kWh`)
            .join(" · "),
          sourcePageUrl: entry.sourcePageUrl,
          documentUrl: entry.documentUrl
        };
      }

      const curatedMapSeed = seedBySlug.get(entry.slug);
      const seed = curatedMapSeed ?? buildFallbackSeed(entry.slug, index);

      return {
        id: entry.slug,
        operatorName: entry.name,
        regionLabel: entry.regionLabel,
        mapRank: seed.mapRank,
        coverageKind: seed.coverageKind,
        geometryPrecision: seed.coveragePrecision,
        geometrySourceLabel: seed.geometrySourceLabel,
        geometrySourceUrl: null,
        anchors: seed.anchors,
        stateHints: seed.stateHints,
        coverageUnits: [],
        geometry: null,
        mapDisplayMode: curatedMapSeed ? ("anchor" as const) : ("hidden" as const),
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
    const geometry = feature.geometry
      ? normalizeGeometryForProjection(feature.geometry, pathBuilder, width, height)
      : null;
    const projectedGeometryPath = geometry ? pathBuilder(geometry) ?? null : null;
    const primaryAnchor = feature.anchors[0];
    const projectedAnchorFromGeometry = geometry
      ? pathBuilder.centroid({
          type: "Feature",
          geometry,
          properties: {}
        })
      : null;
    const projectedAnchorFromSeed = primaryAnchor
      ? projection([primaryAnchor.longitude, primaryAnchor.latitude])
      : null;
    const projectedAnchor =
      projectedAnchorFromGeometry ??
      projectedAnchorFromSeed ?? [
        width / 2,
        height / 2
      ];

    return {
      ...feature,
      searchMatch: feature.searchMatch ?? true,
      mapDisplayMode:
        feature.mapDisplayMode ?? (geometry ? "polygon" : feature.anchors.length > 0 ? "anchor" : "hidden"),
      coverageUnitCount: feature.coverageUnits?.length ?? 0,
      projectedGeometryPath,
      projectedFocusPoint: {
        x: projectedAnchor[0],
        y: projectedAnchor[1]
      },
      projectedOverlays:
        feature.mapDisplayMode === "polygon"
          ? []
          : feature.anchors
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
    attribution: getGermanyMapAttribution(),
    mappedOperatorCount: operators.filter((feature) => feature.mapDisplayMode === "polygon").length,
    hiddenOperatorCount: operators.filter((feature) => feature.mapDisplayMode === "hidden").length
  };
}
