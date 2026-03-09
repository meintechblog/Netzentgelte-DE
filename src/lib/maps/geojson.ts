import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";

export type OperatorMapFeature = {
  id: string;
  operatorName: string;
  regionLabel: string;
  currentBandsSummary: string;
  sourcePageUrl: string;
  documentUrl: string;
  geometry: Record<string, unknown> | null;
};

export function getRegistryMapFeatures(operators: PublishedOperator[]): OperatorMapFeature[] {
  return operators.map((entry) => ({
    id: entry.slug,
    operatorName: entry.name,
    regionLabel: entry.regionLabel,
    currentBandsSummary: summarizePublishedOperatorBands(entry),
    sourcePageUrl: entry.sourcePageUrl,
    documentUrl: entry.documentUrl,
    geometry: null
  }));
}
