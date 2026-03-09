import {
  buildQuarterlyTariffMatrix,
  type TariffQuarter
} from "./quarterly-tariffs";

export type PublicationIntegrityCheckKey =
  | "review_status_verified"
  | "source_page_url_present"
  | "document_url_present"
  | "valid_from_present"
  | "artifact_evidence_present"
  | "band_count_complete"
  | "band_values_complete"
  | "band_source_quotes_complete"
  | "time_windows_present"
  | "time_window_quotes_complete"
  | "quarter_matrix_consistent"
  | "no_conflicting_band_entries";

export type PublicationIntegrityCheck = {
  key: PublicationIntegrityCheckKey;
  passed: boolean;
  message: string;
};

export type PublicationIntegrityReport = {
  operatorSlug: string;
  operatorName: string;
  publishable: boolean;
  failedCheckKeys: PublicationIntegrityCheckKey[];
  checks: PublicationIntegrityCheck[];
};

export type PublicationIntegrityOperator = {
  slug: string;
  name: string;
  validFrom: string;
  reviewStatus: "pending" | "verified";
  sourcePageUrl: string;
  documentUrl: string;
  sourceSlug: string;
  checkedAt: string | null;
  bands: Array<{
    key: "NT" | "ST" | "HT";
    label: string;
    valueCtPerKwh: string;
    sourceQuote: string;
  }>;
  timeWindows: Array<{
    id: string;
    bandKey: "NT" | "ST" | "HT";
    label: string;
    seasonLabel: string;
    dayLabel: string;
    timeRangeLabel: string;
    sourceQuote: string;
  }>;
};

function isNonEmpty(value: string | null | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function isUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function isNumericTariff(value: string) {
  return /^-?\d+(?:\.\d+)?$/.test(value);
}

function hasCompleteBands(operator: PublicationIntegrityOperator) {
  const keys = new Set(operator.bands.map((band) => band.key));
  return operator.bands.length === 3 && keys.has("NT") && keys.has("ST") && keys.has("HT");
}

function hasConflictingBandEntries(operator: PublicationIntegrityOperator) {
  return new Set(operator.bands.map((band) => band.key)).size !== operator.bands.length;
}

function isQuarterMatrixConsistent(operator: PublicationIntegrityOperator) {
  if (operator.timeWindows.length === 0) {
    return false;
  }

  const matrix = buildQuarterlyTariffMatrix(operator);

  if (matrix.length !== 4) {
    return false;
  }

  for (const quarter of matrix) {
    for (const group of quarter.groups) {
      if (!isNonEmpty(group.valueCtPerKwh)) {
        return false;
      }

      if (group.timeRanges.length === 0) {
        return false;
      }

      if (new Set(group.timeRanges).size !== group.timeRanges.length) {
        return false;
      }
    }
  }

  if (operator.slug !== "stadtwerke-schwaebisch-hall") {
    return true;
  }

  return passesSchwaebischHallQuarterRule(matrix);
}

function passesSchwaebischHallQuarterRule(matrix: TariffQuarter[]) {
  const byKey = new Map(matrix.map((quarter) => [quarter.key, quarter] as const));

  return (
    hasExactBandSet(byKey.get("Q1"), ["ST", "HT", "NT"]) &&
    hasExactBandSet(byKey.get("Q2"), ["ST", "HT", "NT"]) &&
    hasExactBandSet(byKey.get("Q4"), ["ST", "HT", "NT"]) &&
    hasExactBandSet(byKey.get("Q3"), ["ST"]) &&
    byKey.get("Q3")?.groups[0]?.timeRanges.length === 1 &&
    byKey.get("Q3")?.groups[0]?.timeRanges[0] === "00:00-24:00"
  );
}

function hasExactBandSet(
  quarter: TariffQuarter | undefined,
  expectedBandKeys: Array<"NT" | "ST" | "HT">
) {
  if (!quarter) {
    return false;
  }

  const actual = quarter.groups.map((group) => group.bandKey).sort().join(",");
  const expected = [...expectedBandKeys].sort().join(",");

  return actual === expected;
}

function buildCheck(
  key: PublicationIntegrityCheckKey,
  passed: boolean,
  message: string
): PublicationIntegrityCheck {
  return { key, passed, message };
}

export function getPublicationIntegrityReport(
  operator: PublicationIntegrityOperator
): PublicationIntegrityReport {
  const checks = [
    buildCheck(
      "review_status_verified",
      operator.reviewStatus === "verified",
      "Öffentliche Publikation erlaubt nur verifizierte Datensätze."
    ),
    buildCheck(
      "source_page_url_present",
      isUrl(operator.sourcePageUrl),
      "Eine offizielle Quellseite muss vorhanden sein."
    ),
    buildCheck(
      "document_url_present",
      isUrl(operator.documentUrl),
      "Ein offizielles Dokument muss vorhanden sein."
    ),
    buildCheck(
      "valid_from_present",
      /^\d{4}-\d{2}-\d{2}$/.test(operator.validFrom),
      "Jeder öffentliche Datensatz braucht ein gültiges Startdatum."
    ),
    buildCheck(
      "artifact_evidence_present",
      isNonEmpty(operator.checkedAt) && isNonEmpty(operator.sourceSlug),
      "Der Prüfpfad braucht mindestens einen dokumentierten Checkzeitpunkt und eine Quellkennung."
    ),
    buildCheck(
      "band_count_complete",
      hasCompleteBands(operator),
      "NT, ST und HT müssen vollständig vorliegen."
    ),
    buildCheck(
      "band_values_complete",
      operator.bands.every((band) => isNumericTariff(band.valueCtPerKwh)),
      "Alle Tarifwerte müssen strukturiert und numerisch vorliegen."
    ),
    buildCheck(
      "band_source_quotes_complete",
      operator.bands.every((band) => isNonEmpty(band.sourceQuote)),
      "Jeder Tarifwert braucht einen Rohbeleg."
    ),
    buildCheck(
      "time_windows_present",
      operator.timeWindows.length > 0,
      "Zeitfenster müssen strukturiert vorliegen."
    ),
    buildCheck(
      "time_window_quotes_complete",
      operator.timeWindows.every(
        (window) =>
          isNonEmpty(window.sourceQuote) &&
          isNonEmpty(window.timeRangeLabel) &&
          isNonEmpty(window.seasonLabel)
      ),
      "Jedes Zeitfenster braucht Rohbeleg, Quartals-/Saisonbezug und Uhrzeit."
    ),
    buildCheck(
      "quarter_matrix_consistent",
      isQuarterMatrixConsistent(operator),
      "Die Quartalsmatrix muss widerspruchsfrei und für Schwäbisch Hall PDF-konform sein."
    ),
    buildCheck(
      "no_conflicting_band_entries",
      !hasConflictingBandEntries(operator),
      "Banddefinitionen dürfen nicht widersprüchlich dupliziert sein."
    )
  ];

  const failedCheckKeys = checks.filter((check) => !check.passed).map((check) => check.key);

  return {
    operatorSlug: operator.slug,
    operatorName: operator.name,
    publishable: failedCheckKeys.length === 0,
    failedCheckKeys,
    checks
  };
}

export function getPublicationIntegrityReports<T extends PublicationIntegrityOperator>(operators: T[]) {
  return operators.map((operator) => getPublicationIntegrityReport(operator));
}

export function filterPublishableOperators<T extends PublicationIntegrityOperator>(operators: T[]) {
  return operators.filter((operator) => getPublicationIntegrityReport(operator).publishable);
}
