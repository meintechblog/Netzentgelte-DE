import { describe, expect, test } from "vitest";

import { buildVerifiedOperatorPayload } from "./verified-operator-workflow";

const completeInput = {
  slug: "demo-netz",
  name: "Demo Netz GmbH",
  validFrom: "2026-01-01",
  reviewStatus: "pending" as const,
  sourcePageUrl: "https://example.com/source",
  documentUrl: "https://example.com/document.pdf",
  sourceSlug: "demo-netz-source-2026",
  checkedAt: "2026-03-11",
  bands: [
    {
      key: "NT" as const,
      label: "Niedrigtarif",
      valueCtPerKwh: "1.11",
      sourceQuote: "NT 1,11 ct/kWh"
    },
    {
      key: "ST" as const,
      label: "Standardtarif",
      valueCtPerKwh: "5.55",
      sourceQuote: "ST 5,55 ct/kWh"
    },
    {
      key: "HT" as const,
      label: "Hochtarif",
      valueCtPerKwh: "8.88",
      sourceQuote: "HT 8,88 ct/kWh"
    }
  ],
  timeWindows: [
    {
      id: "demo-q1q4-nt",
      bandKey: "NT" as const,
      label: "Niedrigtarif",
      seasonLabel: "Q1-Q4 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "01:00-05:30",
      sourceQuote: "NT 01:00-05:30"
    },
    {
      id: "demo-q1q4-ht",
      bandKey: "HT" as const,
      label: "Hochtarif",
      seasonLabel: "Q1-Q4 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "17:30-20:15",
      sourceQuote: "HT 17:30-20:15"
    },
    {
      id: "demo-q1q4-st",
      bandKey: "ST" as const,
      label: "Standardtarif",
      seasonLabel: "Q1-Q4 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "00:00-24:00",
      sourceQuote: "Alle restlichen Zeiten"
    }
  ]
};

describe("buildVerifiedOperatorPayload", () => {
  test("returns a verified payload when all public integrity requirements are met", () => {
    const result = buildVerifiedOperatorPayload(completeInput);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("expected verified payload");
    }
    expect(result.operator.reviewStatus).toBe("verified");
  });

  test("blocks incomplete operators instead of silently promoting them", () => {
    const result = buildVerifiedOperatorPayload({
      ...completeInput,
      bands: completeInput.bands.slice(0, 2),
      timeWindows: []
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected blocked payload");
    }
    expect(result.failedCheckKeys).toEqual(
      expect.arrayContaining(["band_count_complete", "time_windows_present", "quarter_matrix_consistent"])
    );
  });
});
