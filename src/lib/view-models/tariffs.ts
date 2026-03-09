import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";

export type TariffTableRow = {
  operatorName: string;
  operatorSlug: string;
  currentBandsSummary: string;
  validFrom: string;
  sourcePageUrl: string;
  documentUrl: string;
  reviewStatus: "pending" | "verified";
};

export function getRegistryTariffRows(operators: PublishedOperator[]): TariffTableRow[] {
  return operators.map((entry) => ({
    operatorName: entry.name,
    operatorSlug: entry.slug,
    currentBandsSummary: summarizePublishedOperatorBands(entry),
    validFrom: entry.validFrom,
    sourcePageUrl: entry.sourcePageUrl,
    documentUrl: entry.documentUrl,
    reviewStatus: entry.reviewStatus
  }));
}
