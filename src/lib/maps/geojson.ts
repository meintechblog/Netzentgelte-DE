import { formatBandSummary, getOperatorRegistry } from "../../modules/operators/registry";

export type OperatorMapFeature = {
  id: string;
  operatorName: string;
  regionLabel: string;
  currentBandsSummary: string;
  sourcePageUrl: string;
  documentUrl: string;
  geometry: Record<string, unknown> | null;
};

export function getRegistryMapFeatures(): OperatorMapFeature[] {
  return getOperatorRegistry().map((entry) => ({
    id: entry.slug,
    operatorName: entry.name,
    regionLabel: entry.regionLabel,
    currentBandsSummary: formatBandSummary(entry),
    sourcePageUrl: entry.currentTariff.sourcePageUrl,
    documentUrl: entry.currentTariff.documentUrl,
    geometry: null
  }));
}
