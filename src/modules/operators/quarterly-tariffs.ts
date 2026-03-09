export type TariffQuarterKey = "Q1" | "Q2" | "Q3" | "Q4";

export type TariffQuarterGroup = {
  bandKey: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  timeRanges: string[];
  sourceQuotes: string[];
  coverageStatus: "official" | "assumed-st";
};

export type TariffQuarterEntry = {
  bandKey: "NT" | "ST" | "HT";
  label: string;
  valueCtPerKwh: string;
  timeRange: string;
};

export type TariffQuarterSlot = {
  slotIndex: number;
  startLabel: string;
  endLabel: string;
  timeLabel: string;
  bandKey: "NT" | "ST" | "HT" | null;
  bandLabel: string;
  valueCtPerKwh: string;
  isHourStart: boolean;
  coverageStatus: "official" | "assumed-st" | "empty";
};

export type TariffQuarterSegment = {
  startSlotIndex: number;
  endSlotIndex: number;
  startLabel: string;
  endLabel: string;
  timeLabel: string;
  bandKey: "NT" | "ST" | "HT" | null;
  bandLabel: string;
  valueCtPerKwh: string;
  coverageStatus: "official" | "assumed-st" | "empty";
};

export type TariffQuarter = {
  key: TariffQuarterKey;
  label: TariffQuarterKey;
  summaryLabel: string;
  coverageStatus: "official" | "assumed-st" | "empty";
  groups: TariffQuarterGroup[];
  timelineEntries: TariffQuarterEntry[];
  slots: TariffQuarterSlot[];
  segments: TariffQuarterSegment[];
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
const SLOT_MINUTES = 15;
const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;

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

function getQuarterSummaryLabel(
  groups: TariffQuarterGroup[],
  coverageStatus: TariffQuarter["coverageStatus"]
) {
  if (coverageStatus === "assumed-st") {
    return "Quelle ohne Zeitfenster";
  }

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

  return groups.length > 0 ? `${groups.length} Tarifgruppen` : "Keine Zeitfenster";
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

function isCatchAllTimeRange(timeRange: string) {
  return getCatchAllRank(timeRange) > 0;
}

function formatTimeLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainderMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainderMinutes).padStart(2, "0")}`;
}

function buildEmptyQuarterSlots(): TariffQuarterSlot[] {
  return Array.from({ length: SLOTS_PER_DAY }, (_, slotIndex) => {
    const startMinutes = slotIndex * SLOT_MINUTES;
    const endMinutes = startMinutes + SLOT_MINUTES;

    return {
      slotIndex,
      startLabel: formatTimeLabel(startMinutes),
      endLabel: formatTimeLabel(endMinutes),
      timeLabel: `${formatTimeLabel(startMinutes)}-${formatTimeLabel(endMinutes)}`,
      bandKey: null,
      bandLabel: "Keine Zuordnung",
      valueCtPerKwh: "",
      isHourStart: startMinutes % 60 === 0,
      coverageStatus: "empty"
    };
  });
}

function parseTimeRangeToSlotBounds(timeRange: string) {
  const match = timeRange.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);

  if (!match) {
    return null;
  }

  const startMinutes = parseMinutes(match[1]!);
  const endMinutes = parseMinutes(match[2]!);

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    return null;
  }

  if (endMinutes <= startMinutes) {
    return [
      {
        startIndex: Math.max(0, Math.floor(startMinutes / SLOT_MINUTES)),
        endIndex: SLOTS_PER_DAY
      },
      {
        startIndex: 0,
        endIndex: Math.min(SLOTS_PER_DAY, Math.ceil(endMinutes / SLOT_MINUTES))
      }
    ];
  }

  return [
    {
      startIndex: Math.max(0, Math.floor(startMinutes / SLOT_MINUTES)),
      endIndex: Math.min(SLOTS_PER_DAY, Math.ceil(endMinutes / SLOT_MINUTES))
    }
  ];
}

function applyTimeRangeToSlots(
  slots: TariffQuarterSlot[],
  group: TariffQuarterGroup,
  timeRange: string,
  onlyEmpty: boolean
) {
  const slotBounds = parseTimeRangeToSlotBounds(timeRange);

  if (!slotBounds) {
    return;
  }

  for (const bounds of slotBounds) {
    for (let slotIndex = bounds.startIndex; slotIndex < bounds.endIndex; slotIndex += 1) {
      if (onlyEmpty && slots[slotIndex]?.bandKey) {
        continue;
      }

      const slot = slots[slotIndex];

      if (!slot) {
        continue;
      }

      slots[slotIndex] = {
        ...slot,
        bandKey: group.bandKey,
        bandLabel: group.label,
        valueCtPerKwh: group.valueCtPerKwh,
        coverageStatus: group.coverageStatus
      };
    }
  }
}

function buildQuarterSlots(groups: TariffQuarterGroup[]) {
  const slots = buildEmptyQuarterSlots();
  const explicitTimeRanges: Array<{ group: TariffQuarterGroup; timeRange: string }> = [];
  const catchAllTimeRanges: Array<{ group: TariffQuarterGroup; timeRange: string }> = [];

  for (const group of groups) {
    for (const timeRange of group.timeRanges) {
      if (isCatchAllTimeRange(timeRange)) {
        catchAllTimeRanges.push({ group, timeRange });
        continue;
      }

      explicitTimeRanges.push({ group, timeRange });
    }
  }

  explicitTimeRanges.sort((left, right) => compareTimeRanges(left.timeRange, right.timeRange));
  catchAllTimeRanges.sort((left, right) => compareTimeRanges(left.timeRange, right.timeRange));

  for (const entry of explicitTimeRanges) {
    applyTimeRangeToSlots(slots, entry.group, entry.timeRange, false);
  }

  for (const entry of catchAllTimeRanges) {
    applyTimeRangeToSlots(slots, entry.group, "00:00-24:00", true);
  }

  return slots;
}

function buildQuarterSegments(slots: TariffQuarterSlot[]): TariffQuarterSegment[] {
  if (slots.length === 0) {
    return [];
  }

  const segments: TariffQuarterSegment[] = [];
  let startSlotIndex = 0;
  let currentSlot = slots[0]!;

  function pushSegment(endSlotIndex: number) {
    const lastSlot = slots[endSlotIndex - 1];

    if (!lastSlot) {
      return;
    }

    segments.push({
      startSlotIndex,
      endSlotIndex,
      startLabel: currentSlot.startLabel,
      endLabel: lastSlot.endLabel,
      timeLabel: `${currentSlot.startLabel}-${lastSlot.endLabel}`,
      bandKey: currentSlot.bandKey,
      bandLabel: currentSlot.bandLabel,
      valueCtPerKwh: currentSlot.valueCtPerKwh,
      coverageStatus: currentSlot.coverageStatus
    });
  }

  for (let slotIndex = 1; slotIndex < slots.length; slotIndex += 1) {
    const nextSlot = slots[slotIndex]!;
    const isSameBand =
      nextSlot.bandKey === currentSlot.bandKey &&
      nextSlot.valueCtPerKwh === currentSlot.valueCtPerKwh &&
      nextSlot.bandLabel === currentSlot.bandLabel;

    if (isSameBand) {
      continue;
    }

    pushSegment(slotIndex);
    startSlotIndex = slotIndex;
    currentSlot = nextSlot;
  }

  pushSegment(slots.length);

  return segments;
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

function buildAssumedStandardGroup(
  bandValueMap: ReturnType<typeof getBandValueMap>
): TariffQuarterGroup[] {
  const standardBand = bandValueMap.get("ST");

  if (!standardBand?.valueCtPerKwh) {
    return [];
  }

  return [
    {
      bandKey: "ST",
      label: standardBand.label,
      valueCtPerKwh: standardBand.valueCtPerKwh,
      timeRanges: ["00:00-24:00"],
      sourceQuotes: [
        "Verifizierte ST-Annahme: Für dieses Quartal sind im Originaldokument keine Zeitfenster veröffentlicht."
      ],
      coverageStatus: "assumed-st"
    }
  ];
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
        sourceQuotes: [window.sourceQuote],
        coverageStatus: "official"
      });
    }
  }

  return QUARTER_ORDER.map((quarter) => {
    const officialGroups = [...(groupsByQuarter.get(quarter)?.values() ?? [])].sort(
      (left, right) => BAND_DISPLAY_ORDER[left.bandKey] - BAND_DISPLAY_ORDER[right.bandKey]
    );
    const groups = officialGroups.length > 0 ? officialGroups : buildAssumedStandardGroup(bandValueMap);
    const coverageStatus =
      groups[0]?.coverageStatus ?? (officialGroups.length > 0 ? "official" : "empty");
    const slots = buildQuarterSlots(groups);

    return {
      key: quarter,
      label: quarter,
      summaryLabel: getQuarterSummaryLabel(groups, coverageStatus),
      coverageStatus,
      groups,
      timelineEntries: buildQuarterTimelineEntries(groups),
      slots,
      segments: buildQuarterSegments(slots)
    };
  });
}
