export type TariffQuarterKey = "Q1" | "Q2" | "Q3" | "Q4";

export type TariffQuarterGroup = {
  bandKey: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  timeRanges: string[];
  sourceQuotes: string[];
};

export type TariffQuarterEntry = {
  bandKey: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  timeRange: string;
};

export type TariffQuarter = {
  key: TariffQuarterKey;
  label: TariffQuarterKey;
  summaryLabel: string;
  groups: TariffQuarterGroup[];
  timelineEntries: TariffQuarterEntry[];
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

function getCatchAllRank(timeRange: string) {
  const normalized = timeRange.toLocaleLowerCase("de-DE");

  if (
    normalized.includes("alle anderen zeiten") ||
    normalized.includes("alle restlichen zeiten") ||
    normalized.includes("alle restzeiten")
  ) {
    return 1;
  }

  return 0;
}

function parseMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return Number.POSITIVE_INFINITY;
  }

  return Number.parseInt(match[1]!, 10) * 60 + Number.parseInt(match[2]!, 10);
}

function compareTimeRanges(left: string, right: string) {
  const catchAllRank = getCatchAllRank(left) - getCatchAllRank(right);

  if (catchAllRank !== 0) {
    return catchAllRank;
  }

  const leftMatch = left.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
  const rightMatch = right.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);

  if (!leftMatch || !rightMatch) {
    return left.localeCompare(right, "de-DE");
  }

  const startDifference = parseMinutes(leftMatch[1]!) - parseMinutes(rightMatch[1]!);

  if (startDifference !== 0) {
    return startDifference;
  }

  return parseMinutes(leftMatch[2]!) - parseMinutes(rightMatch[2]!);
}

function buildQuarterTimelineEntries(groups: TariffQuarterGroup[]): TariffQuarterEntry[] {
  return groups
    .flatMap((group) =>
      group.timeRanges.map((timeRange) => ({
        bandKey: group.bandKey,
        label: group.label,
        valueCtPerKwh: group.valueCtPerKwh,
        timeRange
      }))
    )
    .sort((left, right) => compareTimeRanges(left.timeRange, right.timeRange));
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
          existing.timeRanges.sort(compareTimeRanges);
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
      groups,
      timelineEntries: buildQuarterTimelineEntries(groups)
    };
  });
}
