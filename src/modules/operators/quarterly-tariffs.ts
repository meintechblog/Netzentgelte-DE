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

export type QuarterlyTariffInput = {
  bands: Array<{
    key: "NT" | "ST" | "HT";
    label: string;
    valueCtPerKwh: string;
  }>;
  timeWindows: Array<{
    bandKey: "NT" | "ST" | "HT";
    label: string;
    seasonLabel: string;
    timeRangeLabel: string;
    sourceQuote: string;
  }>;
};

const QUARTER_ORDER: TariffQuarterKey[] = ["Q1", "Q2", "Q3", "Q4"];

const BAND_DISPLAY_ORDER: Record<TariffQuarterGroup["bandKey"], number> = {
  ST: 0,
  HT: 1,
  NT: 2
};

function getBandValueMap(input: QuarterlyTariffInput) {
  return new Map(input.bands.map((band) => [band.key, band] as const));
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

  const quarterMatches = [...seasonLabel.matchAll(/Q([1-4])/g)].map(
    (match) => `Q${match[1]}` as TariffQuarterKey
  );

  if (quarterMatches.length > 0) {
    return [...new Set(quarterMatches)];
  }

  return [...QUARTER_ORDER];
}

function getQuarterSummaryLabel(groups: TariffQuarterGroup[]) {
  if (
    groups.length === 1 &&
    groups[0]?.bandKey === "ST" &&
    groups[0].timeRanges.length === 1 &&
    groups[0].timeRanges[0] === "00:00-24:00"
  ) {
    return "Nur Standardtarif";
  }

  if (groups.length === 3) {
    return "Tarifstufen aktiv";
  }

  return groups.length > 0 ? `${groups.length} Tarifgruppen` : "Keine Tariffenster";
}

export function buildQuarterlyTariffMatrix(input: QuarterlyTariffInput): TariffQuarter[] {
  const bandValueMap = getBandValueMap(input);
  const groupsByQuarter = new Map<
    TariffQuarterKey,
    Map<TariffQuarterGroup["bandKey"], TariffQuarterGroup>
  >();

  for (const quarter of QUARTER_ORDER) {
    groupsByQuarter.set(quarter, new Map());
  }

  for (const window of input.timeWindows) {
    const band = bandValueMap.get(window.bandKey);

    for (const quarter of expandSeasonLabelToQuarters(window.seasonLabel)) {
      const quarterGroups = groupsByQuarter.get(quarter);
      const existing = quarterGroups?.get(window.bandKey);

      if (existing) {
        if (!existing.timeRanges.includes(window.timeRangeLabel)) {
          existing.timeRanges.push(window.timeRangeLabel);
        }
        if (!existing.sourceQuotes.includes(window.sourceQuote)) {
          existing.sourceQuotes.push(window.sourceQuote);
        }
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
      summaryLabel: getQuarterSummaryLabel(groups),
      groups
    };
  });
}

