import { describe, expect, test } from "vitest";

import { evaluateModul3Compliance } from "./modul-3-evaluator";
import { getActiveModul3RuleSet } from "./rule-catalog";

function buildInput(overrides?: Partial<Parameters<typeof evaluateModul3Compliance>[0]>) {
  return {
    operatorSlug: "testnetz",
    operatorName: "Testnetz GmbH",
    bands: [
      { key: "NT" as const, label: "Niedrigtarif", valueCtPerKwh: "2.00", priceBasis: "netto" as const },
      { key: "ST" as const, label: "Standardtarif", valueCtPerKwh: "10.00", priceBasis: "netto" as const },
      { key: "HT" as const, label: "Hochtarif", valueCtPerKwh: "15.00", priceBasis: "netto" as const }
    ],
    timeWindows: [
      {
        bandKey: "NT" as const,
        label: "Niedrigtarif",
        seasonLabel: "Q1 und Q4 2026",
        timeRangeLabel: "00:00-04:00",
        sourceQuote: "NT 00:00-04:00"
      },
      {
        bandKey: "HT" as const,
        label: "Hochtarif",
        seasonLabel: "Q1 und Q4 2026",
        timeRangeLabel: "17:00-20:00",
        sourceQuote: "HT 17:00-20:00"
      },
      {
        bandKey: "ST" as const,
        label: "Standardtarif",
        seasonLabel: "Q1 und Q4 2026",
        timeRangeLabel: "04:00-17:00",
        sourceQuote: "ST 04:00-17:00"
      },
      {
        bandKey: "ST" as const,
        label: "Standardtarif",
        seasonLabel: "Q1 und Q4 2026",
        timeRangeLabel: "20:00-24:00",
        sourceQuote: "ST 20:00-24:00"
      }
    ],
    ruleSet: getActiveModul3RuleSet(),
    ...overrides
  };
}

describe("evaluateModul3Compliance", () => {
  test("marks compliant operators as compliant when all machine-checkable rules pass", () => {
    const evaluation = evaluateModul3Compliance(buildInput());

    expect(evaluation.status).toBe("compliant");
    expect(evaluation.violations).toHaveLength(0);
    expect(evaluation.passes).toHaveLength(6);
    expect(evaluation.notEvaluated).toHaveLength(0);
  });

  test("flags HT windows shorter than two hours as a violation", () => {
    const evaluation = evaluateModul3Compliance(
      buildInput({
        timeWindows: [
          {
            bandKey: "NT",
            label: "Niedrigtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "00:00-04:00",
            sourceQuote: "NT 00:00-04:00"
          },
          {
            bandKey: "HT",
            label: "Hochtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "18:00-18:30",
            sourceQuote: "HT 18:00-18:30"
          }
        ]
      })
    );

    expect(evaluation.status).toBe("violation");
    expect(evaluation.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "ht_min_2h_per_day"
        }),
        expect.objectContaining({
          ruleId: "full_day_coverage_in_active_quarters"
        })
      ])
    );
  });

  test("flags NT prices outside the 10 to 40 percent corridor of ST", () => {
    const evaluation = evaluateModul3Compliance(
      buildInput({
        bands: [
          { key: "NT", label: "Niedrigtarif", valueCtPerKwh: "5.50", priceBasis: "netto" },
          { key: "ST", label: "Standardtarif", valueCtPerKwh: "10.00", priceBasis: "netto" },
          { key: "HT", label: "Hochtarif", valueCtPerKwh: "15.00", priceBasis: "netto" }
        ]
      })
    );

    expect(evaluation.status).toBe("violation");
    expect(evaluation.violations).toEqual([
      expect.objectContaining({
        ruleId: "nt_between_10_and_40_percent_of_st"
      })
    ]);
  });

  test("treats corridor boundary cases as compliant after kaufmaennisch rounding", () => {
    const evaluation = evaluateModul3Compliance(
      buildInput({
        operatorSlug: "netze-bw",
        operatorName: "Netze BW GmbH",
        bands: [
          { key: "NT", label: "Niedrigtarif", valueCtPerKwh: "3.03", priceBasis: "netto" },
          { key: "ST", label: "Standardtarif", valueCtPerKwh: "7.57", priceBasis: "netto" },
          { key: "HT", label: "Hochtarif", valueCtPerKwh: "15.14", priceBasis: "netto" }
        ]
      })
    );

    expect(evaluation.violations).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "nt_between_10_and_40_percent_of_st"
        })
      ])
    );
  });

  test("flags operators that publish HT and NT in fewer than two quarters", () => {
    const evaluation = evaluateModul3Compliance(
      buildInput({
        timeWindows: [
          {
            bandKey: "NT",
            label: "Niedrigtarif",
            seasonLabel: "Q1 2026",
            timeRangeLabel: "00:00-04:00",
            sourceQuote: "NT 00:00-04:00"
          },
          {
            bandKey: "HT",
            label: "Hochtarif",
            seasonLabel: "Q1 2026",
            timeRangeLabel: "17:00-20:00",
            sourceQuote: "HT 17:00-20:00"
          }
        ]
      })
    );

    expect(evaluation.status).toBe("violation");
    expect(evaluation.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "at_least_two_quarters_active"
        }),
        expect.objectContaining({
          ruleId: "full_day_coverage_in_active_quarters"
        })
      ])
    );
  });

  test("flags operators whose active quarters change the published windows", () => {
    const evaluation = evaluateModul3Compliance(
      buildInput({
        timeWindows: [
          {
            bandKey: "NT",
            label: "Niedrigtarif",
            seasonLabel: "Q1 2026",
            timeRangeLabel: "00:00-04:00",
            sourceQuote: "NT Q1 00:00-04:00"
          },
          {
            bandKey: "NT",
            label: "Niedrigtarif",
            seasonLabel: "Q4 2026",
            timeRangeLabel: "00:00-05:00",
            sourceQuote: "NT Q4 00:00-05:00"
          },
          {
            bandKey: "HT",
            label: "Hochtarif",
            seasonLabel: "Q1 2026",
            timeRangeLabel: "17:00-20:00",
            sourceQuote: "HT Q1 17:00-20:00"
          },
          {
            bandKey: "HT",
            label: "Hochtarif",
            seasonLabel: "Q4 2026",
            timeRangeLabel: "18:00-21:00",
            sourceQuote: "HT Q4 18:00-21:00"
          }
        ]
      })
    );

    expect(evaluation.status).toBe("violation");
    expect(evaluation.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "same_time_windows_across_quarters"
        }),
        expect.objectContaining({
          ruleId: "full_day_coverage_in_active_quarters"
        })
      ])
    );
  });

  test("flags active quarters with uncovered time slots as a violation", () => {
    const evaluation = evaluateModul3Compliance(
      buildInput({
        operatorSlug: "alliander-netz-heinsberg",
        operatorName: "Alliander Netz Heinsberg GmbH",
        timeWindows: [
          {
            bandKey: "NT",
            label: "Niedrigtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "00:00-06:00",
            sourceQuote: "NT 0:00-6:00"
          },
          {
            bandKey: "ST",
            label: "Standardtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "07:00-11:00",
            sourceQuote: "ST 7:00-11:00"
          },
          {
            bandKey: "HT",
            label: "Hochtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "11:00-15:15",
            sourceQuote: "HT 11:00-15:15"
          },
          {
            bandKey: "ST",
            label: "Standardtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "15:15-17:15",
            sourceQuote: "ST 15:15-17:15"
          },
          {
            bandKey: "HT",
            label: "Hochtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "17:15-20:00",
            sourceQuote: "HT 17:15-20:00"
          },
          {
            bandKey: "ST",
            label: "Standardtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "20:00-23:30",
            sourceQuote: "ST 20:00-23:30"
          },
          {
            bandKey: "NT",
            label: "Niedrigtarif",
            seasonLabel: "Q1 und Q4 2026",
            timeRangeLabel: "23:30-00:00",
            sourceQuote: "NT 23:30-0:00"
          }
        ]
      })
    );

    expect(evaluation.status).toBe("violation");
    expect(evaluation.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "full_day_coverage_in_active_quarters"
        })
      ])
    );
  });

  test("marks rules as not evaluable when mandatory pricing basis or tariff bands are missing", () => {
    const evaluation = evaluateModul3Compliance(
      buildInput({
        bands: [{ key: "ST", label: "Standardtarif", valueCtPerKwh: "10.00", priceBasis: "netto" }]
      })
    );

    expect(evaluation.status).toBe("not-evaluable");
    expect(evaluation.notEvaluated).toEqual([
      expect.objectContaining({ ruleId: "ht_max_100_percent_above_st" }),
      expect.objectContaining({ ruleId: "nt_between_10_and_40_percent_of_st" })
    ]);
  });
});
