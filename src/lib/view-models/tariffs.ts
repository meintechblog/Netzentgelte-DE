import { formatBandSummary, getOperatorRegistry } from "../../modules/operators/registry";

export type TariffTableRow = {
  operatorName: string;
  operatorSlug: string;
  currentBandsSummary: string;
  validFrom: string;
  sourcePageUrl: string;
  documentUrl: string;
  reviewStatus: "pending" | "verified";
};

export function getRegistryTariffRows(): TariffTableRow[] {
  return getOperatorRegistry().map((entry) => ({
    operatorName: entry.name,
    operatorSlug: entry.slug,
    currentBandsSummary: formatBandSummary(entry),
    validFrom: entry.currentTariff.validFrom,
    sourcePageUrl: entry.currentTariff.sourcePageUrl,
    documentUrl: entry.currentTariff.documentUrl,
    reviewStatus: entry.currentTariff.reviewStatus
  }));
}
