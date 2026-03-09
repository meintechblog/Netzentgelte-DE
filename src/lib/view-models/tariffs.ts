import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";
export {
  buildQuarterlyTariffMatrix,
  expandSeasonLabelToQuarters,
  type TariffQuarterEntry,
  type TariffQuarter,
  type TariffQuarterGroup,
  type TariffQuarterKey
} from "../../modules/operators/quarterly-tariffs";
import { buildQuarterlyTariffMatrix, type TariffQuarter } from "../../modules/operators/quarterly-tariffs";

export type TariffBandBadge = {
  key: "NT" | "ST" | "HT";
  valueCtPerKwh: string;
};

export type TariffTableRow = {
  operatorName: string;
  operatorSlug: string;
  regionLabel: string;
  currentBandsSummary: string;
  currentBandBadges?: TariffBandBadge[];
  validFrom: string;
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  reviewStatus: "pending" | "verified";
  timeWindows: PublishedOperator["timeWindows"];
  quarterMatrix: TariffQuarter[];
};

export function getRegistryTariffRows(operators: PublishedOperator[]): TariffTableRow[] {
  return operators.map((entry) => ({
    operatorName: entry.name,
    operatorSlug: entry.slug,
    regionLabel: entry.regionLabel,
    currentBandsSummary: summarizePublishedOperatorBands(entry),
    currentBandBadges: entry.bands.map((band) => ({
      key: band.key,
      valueCtPerKwh: band.valueCtPerKwh
    })),
    validFrom: entry.validFrom,
    sourcePageUrl: entry.sourcePageUrl,
    documentUrl: entry.documentUrl,
    sourceSlug: entry.sourceSlug,
    checkedAt: entry.checkedAt,
    reviewStatus: entry.reviewStatus,
    timeWindows: entry.timeWindows,
    quarterMatrix: buildQuarterlyTariffMatrix({
      bands: entry.bands,
      timeWindows: entry.timeWindows
    })
  }));
}
