import {
  summarizePublishedOperatorBands,
  type PublishedOperator
} from "../../modules/operators/current-catalog";

export type TariffQuarterKey = "Q1" | "Q2" | "Q3" | "Q4";

export type TariffQuarterGroup = {
  bandKey: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  timeRanges: string[];
  sourceQuotes: string[];
};

export type TariffQuarter = {
  key: TariffQuarterKey;
  label: TariffQuarterKey;
  summaryLabel: string;
  groups: TariffQuarterGroup[];
};

export type TariffTableRow = {
  operatorName: string;
  operatorSlug: string;
  regionLabel: string;
  currentBandsSummary: string;
  validFrom: string;
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  reviewStatus: "pending" | "verified";
  timeWindows: PublishedOperator["timeWindows"];
  quarterMatrix: TariffQuarter[];
};

const QUARTER_ORDER: TariffQuarterKey[] = ["Q1", "Q2", "Q3", "Q4"];

const BAND_DISPLAY_ORDER: Record<TariffQuarterGroup["bandKey"], number> = {
  ST: 0,
  HT: 1,
  NT: 2
};

function getBandValueMap(operator: PublishedOperator) {
  return new Map(operator.bands.map((band) => [band.key, band] as const));
}

export function expandSeasonLabelToQuarters(seasonLabel: string): TariffQuarterKey[] {
  const normalized = seasonLabel.toLocaleLowerCase("de-DE");

  if (normalized.includes("ganzjährig") || normalized.includes("q1-q4")) {
    return [...QUARTER_ORDER];
  }

  if (normalized.includes("sommer")) {
    return ["Q2", "Q3"];
  }

  if (normalized.includes("winter")) {
    return ["Q1", "Q4"];
  }

  const quarterMatches = [...seasonLabel.matchAll(/Q([1-4])/g)].map((match) => `Q${match[1]}` as TariffQuarterKey);

  if (quarterMatches.length > 0) {
    return [...new Set(quarterMatches)];
  }

  return [...QUARTER_ORDER];
}

function buildSchwaebischHallQuarterMatrix(operator: PublishedOperator): TariffQuarter[] {
  const bandValueMap = getBandValueMap(operator);
  const standardBand = bandValueMap.get("ST");
  const highBand = bandValueMap.get("HT");
  const lowBand = bandValueMap.get("NT");

  const winterLikeGroups = [
    {
      bandKey: "ST" as const,
      label: standardBand?.label ?? "Standardtarif",
      valueCtPerKwh: standardBand?.valueCtPerKwh ?? "",
      timeRanges: ["07:00-10:00", "14:00-18:00", "20:00-22:00"],
      sourceQuotes: ["Standardtarif 07:00-10:00, 14:00-18:00, 20:00-22:00"]
    },
    {
      bandKey: "HT" as const,
      label: highBand?.label ?? "Hochtarif",
      valueCtPerKwh: highBand?.valueCtPerKwh ?? "",
      timeRanges: ["10:00-14:00", "18:00-20:00"],
      sourceQuotes: ["Hochtarif 10:00-14:00, 18:00-20:00"]
    },
    {
      bandKey: "NT" as const,
      label: lowBand?.label ?? "Niedrigtarif",
      valueCtPerKwh: lowBand?.valueCtPerKwh ?? "",
      timeRanges: ["00:00-07:00", "22:00-00:00"],
      sourceQuotes: ["Niedrigtarif 00:00-07:00, 22:00-00:00"]
    }
  ];

  return [
    { key: "Q1", label: "Q1", summaryLabel: "Tarifstufen aktiv", groups: winterLikeGroups },
    { key: "Q2", label: "Q2", summaryLabel: "Tarifstufen aktiv", groups: winterLikeGroups },
    {
      key: "Q3",
      label: "Q3",
      summaryLabel: "Nur Standardtarif",
      groups: [
        {
          bandKey: "ST",
          label: standardBand?.label ?? "Standardtarif",
          valueCtPerKwh: standardBand?.valueCtPerKwh ?? "",
          timeRanges: ["00:00-24:00"],
          sourceQuotes: [
            "Im 3. Quartal erfolgt die Abrechnung zum Standardtarif."
          ]
        }
      ]
    },
    { key: "Q4", label: "Q4", summaryLabel: "Tarifstufen aktiv", groups: winterLikeGroups }
  ];
}

export function buildQuarterlyTariffMatrix(operator: PublishedOperator): TariffQuarter[] {
  if (operator.slug === "stadtwerke-schwaebisch-hall") {
    return buildSchwaebischHallQuarterMatrix(operator);
  }

  const bandValueMap = getBandValueMap(operator);
  const groupsByQuarter = new Map<TariffQuarterKey, Map<TariffQuarterGroup["bandKey"], TariffQuarterGroup>>();

  for (const quarter of QUARTER_ORDER) {
    groupsByQuarter.set(quarter, new Map());
  }

  for (const window of operator.timeWindows) {
    const band = bandValueMap.get(window.bandKey);

    for (const quarter of expandSeasonLabelToQuarters(window.seasonLabel)) {
      const quarterGroups = groupsByQuarter.get(quarter);
      const existing = quarterGroups?.get(window.bandKey);

      if (existing) {
        existing.timeRanges.push(window.timeRangeLabel);
        existing.sourceQuotes.push(window.sourceQuote);
        continue;
      }

      quarterGroups?.set(window.bandKey, {
        bandKey: window.bandKey,
        label: window.label,
        valueCtPerKwh: band?.valueCtPerKwh ?? "",
        timeRanges: [window.timeRangeLabel],
        sourceQuotes: [window.sourceQuote]
      });
    }
  }

  return QUARTER_ORDER.map((quarter) => {
    const groups = [...(groupsByQuarter.get(quarter)?.values() ?? [])].sort(
      (left, right) => BAND_DISPLAY_ORDER[left.bandKey] - BAND_DISPLAY_ORDER[right.bandKey]
    );

    return {
      key: quarter,
      label: quarter,
      summaryLabel: groups.length > 0 ? `${groups.length} Tarifgruppen` : "Keine Tariffenster",
      groups
    };
  });
}

export function getRegistryTariffRows(operators: PublishedOperator[]): TariffTableRow[] {
  return operators.map((entry) => ({
    operatorName: entry.name,
    operatorSlug: entry.slug,
    regionLabel: entry.regionLabel,
    currentBandsSummary: summarizePublishedOperatorBands(entry),
    validFrom: entry.validFrom,
    sourcePageUrl: entry.sourcePageUrl,
    documentUrl: entry.documentUrl,
    sourceSlug: entry.sourceSlug,
    checkedAt: entry.checkedAt,
    reviewStatus: entry.reviewStatus,
    timeWindows: entry.timeWindows,
    quarterMatrix: buildQuarterlyTariffMatrix(entry)
  }));
}
