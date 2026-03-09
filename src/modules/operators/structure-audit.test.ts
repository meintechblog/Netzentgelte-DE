import { describe, expect, test } from "vitest";

import {
  buildOperatorStructureAudit,
  getOperatorStructureAuditSummary,
  type StructureAuditOperator
} from "./structure-audit";

const baseOperator: StructureAuditOperator = {
  slug: "demo-netz",
  name: "Demo Netz GmbH",
  regionLabel: "Demo",
  reviewStatus: "verified",
  sourcePageUrl: "https://example.com/source",
  documentUrl: "https://example.com/document.pdf",
  summaryFallback: undefined,
  bands: [
    {
      key: "NT",
      label: "Niedrigtarif",
      valueCtPerKwh: "1.11",
      sourceQuote: "NT 1,11 ct/kWh"
    },
    {
      key: "ST",
      label: "Standardtarif",
      valueCtPerKwh: "5.53",
      sourceQuote: "ST 5,53 ct/kWh"
    },
    {
      key: "HT",
      label: "Hochtarif",
      valueCtPerKwh: "8.14",
      sourceQuote: "HT 8,14 ct/kWh"
    }
  ],
  timeWindows: [
    {
      id: "demo-q1",
      bandKey: "ST",
      label: "Standardtarif",
      seasonLabel: "Q1 2026",
      dayLabel: "Alle Tage",
      timeRangeLabel: "00:00-24:00",
      sourceQuote: "ST 00:00-24:00"
    }
  ]
};

describe("buildOperatorStructureAudit", () => {
  test("flags operators that only expose summary fallback instead of structured tariffs", () => {
    const audit = buildOperatorStructureAudit([
      {
        ...baseOperator,
        slug: "fallback-netz",
        reviewStatus: "pending",
        summaryFallback: "Quelle erfasst, Matrix fehlt",
        bands: [],
        timeWindows: []
      }
    ]);

    expect(audit).toEqual([
      expect.objectContaining({
        operatorSlug: "fallback-netz",
        reasonKey: "summary_fallback_only",
        severity: "pending-review"
      })
    ]);
  });

  test("flags operators that still have bands but no structured time windows", () => {
    const audit = buildOperatorStructureAudit([
      {
        ...baseOperator,
        slug: "legacy-netz",
        timeWindows: []
      }
    ]);

    expect(audit).toEqual([
      expect.objectContaining({
        operatorSlug: "legacy-netz",
        reasonKey: "bands_without_time_windows",
        severity: "legacy-shape"
      })
    ]);
  });

  test("ignores operators that already carry a structured tariff model", () => {
    const audit = buildOperatorStructureAudit([baseOperator]);

    expect(audit).toEqual([]);
  });
});

describe("getOperatorStructureAuditSummary", () => {
  test("returns stable counts by reason and severity", () => {
    const audit = buildOperatorStructureAudit([
      {
        ...baseOperator,
        slug: "fallback-netz",
        reviewStatus: "pending",
        summaryFallback: "Quelle erfasst, Matrix fehlt",
        bands: [],
        timeWindows: []
      },
      {
        ...baseOperator,
        slug: "legacy-netz",
        timeWindows: []
      }
    ]);

    expect(getOperatorStructureAuditSummary(audit)).toEqual({
      itemCount: 2,
      summaryFallbackOnlyCount: 1,
      bandsWithoutTimeWindowsCount: 1,
      pendingReviewCount: 1,
      legacyShapeCount: 1
    });
  });
});
