import { z } from "zod";

import operatorMapSeed from "../../../data/geo/operator-map-seed.json";
import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";

const mapPointSchema = z.object({
  x: z.number(),
  y: z.number()
});

const mapGeometrySchema = z.object({
  kind: z.literal("svg-path"),
  path: z.string().min(1)
});

const mapSeedEntrySchema = z.object({
  slug: z.string(),
  mapLabel: z.string(),
  mapRank: z.number().int(),
  coverageType: z.union([
    z.literal("polygon"),
    z.literal("state"),
    z.literal("metro"),
    z.literal("point-fallback")
  ]),
  geometryPrecision: z.union([
    z.literal("exact"),
    z.literal("regional"),
    z.literal("approximate")
  ]),
  geometrySourceLabel: z.string(),
  centroid: mapPointSchema,
  labelAnchor: mapPointSchema,
  geometry: mapGeometrySchema
});

const mapSeedSchema = z.array(mapSeedEntrySchema);

const parsedOperatorMapSeed = mapSeedSchema.parse(operatorMapSeed);

export type OperatorMapPoint = z.infer<typeof mapPointSchema>;
export type OperatorMapGeometry = z.infer<typeof mapGeometrySchema>;
export type OperatorMapSeedEntry = z.infer<typeof mapSeedEntrySchema>;

export type OperatorMapFeature = {
  id: string;
  operatorName: string;
  regionLabel: string;
  mapLabel: string;
  mapRank: number;
  coverageType: OperatorMapSeedEntry["coverageType"];
  geometryPrecision: OperatorMapSeedEntry["geometryPrecision"];
  geometrySourceLabel: string;
  centroid: OperatorMapPoint;
  labelAnchor: OperatorMapPoint;
  currentBandsSummary: string;
  sourcePageUrl: string;
  documentUrl: string;
  geometry: OperatorMapGeometry;
};

const FALLBACK_POINTS: OperatorMapPoint[] = [
  { x: 180, y: 180 },
  { x: 260, y: 260 },
  { x: 340, y: 340 },
  { x: 420, y: 420 },
  { x: 500, y: 500 },
  { x: 580, y: 580 }
];

function buildFallbackGeometry(point: OperatorMapPoint): OperatorMapGeometry {
  const left = point.x - 12;
  const right = point.x + 12;
  const top = point.y - 12;
  const bottom = point.y + 12;

  return {
    kind: "svg-path",
    path: `M ${left} ${top} L ${right} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`
  };
}

function buildFallbackSeed(slug: string, index: number): OperatorMapSeedEntry {
  const point = FALLBACK_POINTS[index % FALLBACK_POINTS.length];

  return {
    slug,
    mapLabel: slug.slice(0, 3).toUpperCase(),
    mapRank: 100 + index,
    coverageType: "point-fallback",
    geometryPrecision: "approximate",
    geometrySourceLabel: "Automatischer Karten-Fallback",
    centroid: point,
    labelAnchor: point,
    geometry: buildFallbackGeometry(point)
  };
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
        mapLabel: seed.mapLabel,
        mapRank: seed.mapRank,
        coverageType: seed.coverageType,
        geometryPrecision: seed.geometryPrecision,
        geometrySourceLabel: seed.geometrySourceLabel,
        centroid: seed.centroid,
        labelAnchor: seed.labelAnchor,
        currentBandsSummary: summarizePublishedOperatorBands(entry),
        sourcePageUrl: entry.sourcePageUrl,
        documentUrl: entry.documentUrl,
        geometry: seed.geometry
      };
    })
    .sort((left, right) => left.mapRank - right.mapRank);
}
