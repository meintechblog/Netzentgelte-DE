import type { ComplianceBandKey, ComplianceRule, ComplianceRuleSet } from "./rule-catalog";
import {
  buildQuarterlyTariffMatrix,
  expandSeasonLabelToQuarters,
  type TariffQuarterKey
} from "../operators/quarterly-tariffs";
import type { PriceBasis } from "../operators/price-basis";

type EvaluatorBand = {
  key: ComplianceBandKey;
  label: string;
  valueCtPerKwh: string;
  priceBasis: PriceBasis;
};

type EvaluatorTimeWindow = {
  bandKey: ComplianceBandKey;
  label: string;
  seasonLabel: string;
  timeRangeLabel: string;
  sourceQuote: string;
};

export type ComplianceFinding = {
  ruleId: string;
  title: string;
  severity: "low" | "medium" | "high";
  message: string;
  sourceCitation: string;
};

export type ComplianceEvaluation = {
  ruleSetId: string;
  status: "compliant" | "violation" | "not-evaluable";
  violations: ComplianceFinding[];
  passes: ComplianceFinding[];
  notEvaluated: ComplianceFinding[];
};

type EvaluationInput = {
  operatorSlug: string;
  operatorName: string;
  bands: EvaluatorBand[];
  timeWindows: EvaluatorTimeWindow[];
  ruleSet: ComplianceRuleSet;
};

type EvaluationOutcome =
  | { kind: "pass"; message: string }
  | { kind: "violation"; message: string }
  | { kind: "not-evaluable"; message: string };

type ParsedWindow = EvaluatorTimeWindow & {
  quarterKeys: TariffQuarterKey[];
  durationMinutes: number | null;
};

function parseNumericValue(value: string) {
  return /^-?\d+(?:\.\d+)?$/.test(value) ? Number.parseFloat(value) : null;
}

function roundCommercial(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function parseTimeRangeMinutes(timeRangeLabel: string) {
  const match = timeRangeLabel.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const startMinutes = Number.parseInt(match[1]!, 10) * 60 + Number.parseInt(match[2]!, 10);
  const endMinutes = Number.parseInt(match[3]!, 10) * 60 + Number.parseInt(match[4]!, 10);

  if (endMinutes === startMinutes) {
    return 24 * 60;
  }

  if (endMinutes > startMinutes) {
    return endMinutes - startMinutes;
  }

  return 24 * 60 - startMinutes + endMinutes;
}

function normalizeQuarterWindows(timeWindows: EvaluatorTimeWindow[]): ParsedWindow[] {
  return timeWindows.map((timeWindow) => ({
    ...timeWindow,
    quarterKeys: expandSeasonLabelToQuarters(timeWindow.seasonLabel),
    durationMinutes: parseTimeRangeMinutes(timeWindow.timeRangeLabel)
  }));
}

function buildFinding(rule: ComplianceRule, message: string): ComplianceFinding {
  return {
    ruleId: rule.ruleId,
    title: rule.title,
    severity: rule.severity,
    message,
    sourceCitation: rule.sourceCitation
  };
}

function evaluateMinWindowDurationByBand(
  rule: ComplianceRule,
  timeWindows: ParsedWindow[]
): EvaluationOutcome {
  const bandKey = String(rule.parameters.bandKey) as ComplianceBandKey;
  const minMinutes = Number(rule.parameters.minMinutes);
  const bandWindows = timeWindows.filter((timeWindow) => timeWindow.bandKey === bandKey);

  if (bandWindows.length === 0) {
    return {
      kind: "not-evaluable",
      message: `Keine ${bandKey}-Zeitfenster veröffentlicht.`
    };
  }

  const violatingWindow = bandWindows.find(
    (timeWindow) => timeWindow.durationMinutes !== null && timeWindow.durationMinutes < minMinutes
  );

  if (!violatingWindow) {
    return {
      kind: "pass",
      message: `${bandKey}-Zeitfenster erfüllen die Mindestdauer von ${Math.floor(minMinutes / 60)} Stunden.`
    };
  }

  return {
    kind: "violation",
    message: `${bandKey}-Zeitfenster ${violatingWindow.timeRangeLabel} unterschreitet die Mindestdauer von ${Math.floor(
      minMinutes / 60
    )} Stunden.`
  };
}

function getBandValueMap(bands: EvaluatorBand[]) {
  return new Map(bands.map((band) => [band.key, parseNumericValue(band.valueCtPerKwh)] as const));
}

function evaluateMaxRatioBetweenBands(rule: ComplianceRule, bands: EvaluatorBand[]): EvaluationOutcome {
  const bandValues = getBandValueMap(bands);
  const numeratorBandKey = String(rule.parameters.numeratorBandKey) as ComplianceBandKey;
  const denominatorBandKey = String(rule.parameters.denominatorBandKey) as ComplianceBandKey;
  const maxRatio = Number(rule.parameters.maxRatio);

  const numeratorValue = bandValues.get(numeratorBandKey);
  const denominatorValue = bandValues.get(denominatorBandKey);

  if (!numeratorValue || !denominatorValue) {
    return {
      kind: "not-evaluable",
      message: `${numeratorBandKey} oder ${denominatorBandKey} fehlen für die Preisprüfung.`
    };
  }

  if (denominatorValue <= 0) {
    return {
      kind: "not-evaluable",
      message: `${denominatorBandKey} ist nicht positiv und kann nicht als Vergleichsbasis dienen.`
    };
  }

  const ratio = roundCommercial(numeratorValue / denominatorValue, 2);

  if (ratio <= maxRatio) {
    return {
      kind: "pass",
      message: `${numeratorBandKey} bleibt innerhalb des zulässigen Verhältnisses zu ${denominatorBandKey}.`
    };
  }

  return {
    kind: "violation",
    message: `${numeratorBandKey} liegt mit ${numeratorValue.toFixed(2)} ct/kWh über dem zulässigen Verhältnis zu ${denominatorBandKey} ${denominatorValue.toFixed(2)} ct/kWh.`
  };
}

function evaluateBandRatioRange(rule: ComplianceRule, bands: EvaluatorBand[]): EvaluationOutcome {
  const bandValues = getBandValueMap(bands);
  const numeratorBandKey = String(rule.parameters.numeratorBandKey) as ComplianceBandKey;
  const denominatorBandKey = String(rule.parameters.denominatorBandKey) as ComplianceBandKey;
  const minRatio = Number(rule.parameters.minRatio);
  const maxRatio = Number(rule.parameters.maxRatio);
  const numeratorValue = bandValues.get(numeratorBandKey);
  const denominatorValue = bandValues.get(denominatorBandKey);

  if (!numeratorValue || !denominatorValue) {
    return {
      kind: "not-evaluable",
      message: `${numeratorBandKey} oder ${denominatorBandKey} fehlen für die Korridorprüfung.`
    };
  }

  if (denominatorValue <= 0) {
    return {
      kind: "not-evaluable",
      message: `${denominatorBandKey} ist nicht positiv und kann nicht als Vergleichsbasis dienen.`
    };
  }

  const ratio = roundCommercial(numeratorValue / denominatorValue, 2);

  if (ratio >= minRatio && ratio <= maxRatio) {
    return {
      kind: "pass",
      message: `${numeratorBandKey} liegt innerhalb des zulässigen Korridors relativ zu ${denominatorBandKey}.`
    };
  }

  return {
    kind: "violation",
    message: `${numeratorBandKey} liegt mit ${numeratorValue.toFixed(2)} ct/kWh außerhalb des zulässigen Korridors relativ zu ${denominatorBandKey} ${denominatorValue.toFixed(2)} ct/kWh.`
  };
}

function evaluateMinActiveQuartersForBands(
  rule: ComplianceRule,
  timeWindows: ParsedWindow[]
): EvaluationOutcome {
  const bandKeys = (rule.parameters.bandKeys as ComplianceBandKey[]) ?? [];
  const minQuarterCount = Number(rule.parameters.minQuarterCount);

  const activeQuarterSet = new Set<TariffQuarterKey>();

  for (const bandKey of bandKeys) {
    for (const timeWindow of timeWindows.filter((entry) => entry.bandKey === bandKey)) {
      for (const quarterKey of timeWindow.quarterKeys) {
        activeQuarterSet.add(quarterKey);
      }
    }
  }

  if (activeQuarterSet.size === 0) {
    return {
      kind: "not-evaluable",
      message: `Keine veröffentlichten Zeitfenster für ${bandKeys.join(", ")} gefunden.`
    };
  }

  if (activeQuarterSet.size >= minQuarterCount) {
    return {
      kind: "pass",
      message: `${bandKeys.join(" und ")} sind in mindestens ${minQuarterCount} Quartalen aktiv.`
    };
  }

  return {
    kind: "violation",
    message: `${bandKeys.join(" und ")} sind nur in ${activeQuarterSet.size} Quartal(en) aktiv und unterschreiten die Mindestanforderung von ${minQuarterCount}.`
  };
}

function serializeQuarterBandWindows(
  timeWindows: ParsedWindow[],
  bandKey: ComplianceBandKey,
  quarterKey: TariffQuarterKey
) {
  return timeWindows
    .filter((timeWindow) => timeWindow.bandKey === bandKey && timeWindow.quarterKeys.includes(quarterKey))
    .map((timeWindow) => timeWindow.timeRangeLabel)
    .sort()
    .join("|");
}

function evaluateConsistentWindowsAcrossActiveQuarters(
  rule: ComplianceRule,
  timeWindows: ParsedWindow[]
): EvaluationOutcome {
  const bandKeys = (rule.parameters.bandKeys as ComplianceBandKey[]) ?? [];
  const activeQuarterSet = new Set<TariffQuarterKey>();
  const dynamicBandKeySet = new Set<ComplianceBandKey>(bandKeys.filter((bandKey) => bandKey !== "ST"));

  for (const timeWindow of timeWindows) {
    if (!dynamicBandKeySet.has(timeWindow.bandKey)) {
      continue;
    }

    for (const quarterKey of timeWindow.quarterKeys) {
      activeQuarterSet.add(quarterKey);
    }
  }

  const activeQuarters = [...activeQuarterSet].sort();

  if (activeQuarters.length < 2) {
    return {
      kind: "not-evaluable",
      message: "Weniger als zwei dynamische Modul-3-Quartale veröffentlicht."
    };
  }

  const baselineQuarter = activeQuarters[0]!;
  const baselineSignature = bandKeys
    .map((bandKey) => `${bandKey}:${serializeQuarterBandWindows(timeWindows, bandKey, baselineQuarter)}`)
    .join("||");

  const deviatingQuarter = activeQuarters.slice(1).find((quarterKey) => {
    const signature = bandKeys
      .map((bandKey) => `${bandKey}:${serializeQuarterBandWindows(timeWindows, bandKey, quarterKey)}`)
      .join("||");

    return signature !== baselineSignature;
  });

  if (!deviatingQuarter) {
    return {
      kind: "pass",
      message: "Zeitfenster bleiben über aktive Quartale konsistent."
    };
  }

  return {
    kind: "violation",
    message: `Zeitfenster weichen zwischen ${baselineQuarter} und ${deviatingQuarter} voneinander ab.`
  };
}

function evaluateFullDayCoverageInActiveQuarters(
  rule: ComplianceRule,
  input: Pick<EvaluationInput, "bands" | "timeWindows">
): EvaluationOutcome {
  const normalizedWindows = normalizeQuarterWindows(input.timeWindows);
  const activeQuarters = [...new Set(normalizedWindows.flatMap((window) => window.quarterKeys))].sort();

  if (activeQuarters.length === 0) {
    return {
      kind: "not-evaluable",
      message: "Keine aktiven Quartale mit veröffentlichten Modul-3-Zeitfenstern gefunden."
    };
  }

  const quarterMatrix = buildQuarterlyTariffMatrix({
    bands: input.bands,
    timeWindows: input.timeWindows
  });
  const uncoveredQuarter = activeQuarters.find((quarterKey) =>
    quarterMatrix
      .find((quarter) => quarter.key === quarterKey)
      ?.segments.some((segment) => segment.coverageStatus === "empty")
  );

  if (!uncoveredQuarter) {
    return {
      kind: "pass",
      message: "Alle aktiven Quartale sind ohne unbelegte Zeitslots abgedeckt."
    };
  }

  const uncoveredSegment = quarterMatrix
    .find((quarter) => quarter.key === uncoveredQuarter)
    ?.segments.find((segment) => segment.coverageStatus === "empty");

  return {
    kind: "violation",
    message: `Im aktiven Quartal ${uncoveredQuarter} bleibt ${uncoveredSegment?.timeLabel ?? "ein Zeitfenster"} ohne offizielle Tarifzuordnung.`
  };
}

function evaluateRule(
  rule: ComplianceRule,
  input: Pick<EvaluationInput, "bands" | "timeWindows">
): EvaluationOutcome {
  const normalizedWindows = normalizeQuarterWindows(input.timeWindows);

  switch (rule.checkType) {
    case "min_window_duration_by_band":
      return evaluateMinWindowDurationByBand(rule, normalizedWindows);
    case "max_ratio_between_bands":
      return evaluateMaxRatioBetweenBands(rule, input.bands);
    case "band_ratio_range":
      return evaluateBandRatioRange(rule, input.bands);
    case "min_active_quarters_for_bands":
      return evaluateMinActiveQuartersForBands(rule, normalizedWindows);
    case "consistent_windows_across_active_quarters":
      return evaluateConsistentWindowsAcrossActiveQuarters(rule, normalizedWindows);
    case "full_day_coverage_in_active_quarters":
      return evaluateFullDayCoverageInActiveQuarters(rule, input);
  }
}

export function evaluateModul3Compliance(input: EvaluationInput): ComplianceEvaluation {
  const violations: ComplianceFinding[] = [];
  const passes: ComplianceFinding[] = [];
  const notEvaluated: ComplianceFinding[] = [];

  for (const rule of input.ruleSet.rules) {
    const outcome = evaluateRule(rule, input);
    const finding = buildFinding(rule, outcome.message);

    if (outcome.kind === "violation") {
      violations.push(finding);
      continue;
    }

    if (outcome.kind === "not-evaluable") {
      notEvaluated.push(finding);
      continue;
    }

    passes.push(finding);
  }

  return {
    ruleSetId: input.ruleSet.ruleSetId,
    status:
      violations.length > 0
        ? "violation"
        : notEvaluated.length > 0
          ? "not-evaluable"
          : "compliant",
    violations,
    passes,
    notEvaluated
  };
}
