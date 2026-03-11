import { describe, expect, test } from "vitest";

import {
  filterPublishableOperators,
  getPublicationIntegrityReport
} from "./publication-integrity";

const completeVerifiedOperator = {
  slug: "demo-netz",
  name: "Demo Netz GmbH",
  validFrom: "2026-01-01",
  reviewStatus: "verified" as const,
  sourcePageUrl: "https://example.com/source",
  documentUrl: "https://example.com/document.pdf",
  sourceSlug: "demo-netz-source-2026",
  checkedAt: "2026-03-09",
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
      valueCtPerKwh: "5.53",
      sourceQuote: "ST 5,53 ct/kWh"
    },
    {
      key: "HT" as const,
      label: "Hochtarif",
      valueCtPerKwh: "8.14",
      sourceQuote: "HT 8,14 ct/kWh"
    }
  ],
  timeWindows: [
    {
      id: "demo-q124-standard",
      bandKey: "ST" as const,
      label: "Standardtarif",
      seasonLabel: "Q1/Q2/Q4 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "07:00-10:00",
      sourceQuote: "ST 07:00-10:00"
    },
    {
      id: "demo-q124-high",
      bandKey: "HT" as const,
      label: "Hochtarif",
      seasonLabel: "Q1/Q2/Q4 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "10:00-14:00",
      sourceQuote: "HT 10:00-14:00"
    },
    {
      id: "demo-q124-low",
      bandKey: "NT" as const,
      label: "Niedrigtarif",
      seasonLabel: "Q1/Q2/Q4 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "22:00-00:00",
      sourceQuote: "NT 22:00-00:00"
    },
    {
      id: "demo-q3-standard",
      bandKey: "ST" as const,
      label: "Standardtarif",
      seasonLabel: "Q3 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "00:00-24:00",
      sourceQuote: "Q3 Standardtarif 00:00-24:00"
    }
  ]
};

describe("getPublicationIntegrityReport", () => {
  test("marks a fully evidenced verified operator as publishable", () => {
    const report = getPublicationIntegrityReport(completeVerifiedOperator);

    expect(report.publishable).toBe(true);
    expect(report.failedCheckKeys).toEqual([]);
  });

  test("accepts omitted Q2 and Q3 windows when the source only publishes Q1 and Q4 slots", () => {
    const report = getPublicationIntegrityReport({
      ...completeVerifiedOperator,
      slug: "q1-q4-reference-netz",
      timeWindows: [
        {
          id: "demo-q1q4-standard-day",
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 und Q4 2026",
          dayLabel: "Alle Tage",
          timeRangeLabel: "06:00-17:00",
          sourceQuote: "Standardtarif 06:00 - 17:00"
        },
        {
          id: "demo-q1q4-high-evening",
          bandKey: "HT",
          label: "Hochtarif",
          seasonLabel: "Q1 und Q4 2026",
          dayLabel: "Alle Tage",
          timeRangeLabel: "17:00-21:00",
          sourceQuote: "Hochtarif 17:00 - 21:00"
        },
        {
          id: "demo-q1q4-standard-late",
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 und Q4 2026",
          dayLabel: "Alle Tage",
          timeRangeLabel: "21:00-24:00",
          sourceQuote: "Standardtarif 21:00 - 00:00"
        },
        {
          id: "demo-q1q4-low-night",
          bandKey: "NT",
          label: "Niedrigtarif",
          seasonLabel: "Q1 und Q4 2026",
          dayLabel: "Alle Tage",
          timeRangeLabel: "00:00-06:00",
          sourceQuote: "Niedrigtarif 00:00 - 06:00"
        }
      ]
    });

    expect(report.publishable).toBe(true);
    expect(report.failedCheckKeys).toEqual([]);
  });

  test("rejects pending operators from public publication", () => {
    const report = getPublicationIntegrityReport({
      ...completeVerifiedOperator,
      slug: "pending-netz",
      reviewStatus: "pending"
    });

    expect(report.publishable).toBe(false);
    expect(report.failedCheckKeys).toContain("review_status_verified");
  });

  test("rejects operators with missing time-window source quotes", () => {
    const report = getPublicationIntegrityReport({
      ...completeVerifiedOperator,
      slug: "quote-gap-netz",
      timeWindows: [
        {
          ...completeVerifiedOperator.timeWindows[0],
          sourceQuote: ""
        }
      ]
    });

    expect(report.publishable).toBe(false);
    expect(report.failedCheckKeys).toContain("time_window_quotes_complete");
  });

  test("enforces the Stadtwerke Schwäbisch Hall Q3 standard-only rule", () => {
    const report = getPublicationIntegrityReport({
      ...completeVerifiedOperator,
      slug: "stadtwerke-schwaebisch-hall",
      name: "Stadtwerke Schwäbisch Hall GmbH",
      timeWindows: [
        ...completeVerifiedOperator.timeWindows,
        {
          id: "hall-q3-high-invalid",
          bandKey: "HT",
          label: "Hochtarif",
          seasonLabel: "Q3 2026",
          dayLabel: "Alle Tage",
          timeRangeLabel: "18:00-20:00",
          sourceQuote: "Invalid Q3 HT"
        }
      ]
    });

    expect(report.publishable).toBe(false);
    expect(report.failedCheckKeys).toContain("quarter_matrix_consistent");
  });
});

describe("filterPublishableOperators", () => {
  test("keeps only publishable operators", () => {
    const filtered = filterPublishableOperators([
      completeVerifiedOperator,
      {
        ...completeVerifiedOperator,
        slug: "pending-netz",
        reviewStatus: "pending"
      }
    ]);

    expect(filtered).toEqual([
      expect.objectContaining({
        slug: "demo-netz"
      })
    ]);
  });
});
