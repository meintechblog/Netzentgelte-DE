import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../../modules/operators/current-catalog";
import {
  buildQuarterlyTariffMatrix,
  expandSeasonLabelToQuarters,
  getRegistryTariffRows
} from "./tariffs";

describe("expandSeasonLabelToQuarters", () => {
  test("normalizes season labels into concrete quarters", () => {
    expect(expandSeasonLabelToQuarters("Ganzjährig 2026")).toEqual(["Q1", "Q2", "Q3", "Q4"]);
    expect(expandSeasonLabelToQuarters("Q1 und Q4 2026")).toEqual(["Q1", "Q4"]);
    expect(expandSeasonLabelToQuarters("Q2-Q3 2026")).toEqual(["Q2", "Q3"]);
    expect(expandSeasonLabelToQuarters("Sommer 2026")).toEqual(["Q2", "Q3"]);
    expect(expandSeasonLabelToQuarters("Winter 2026")).toEqual(["Q1", "Q4"]);
  });
});

describe("buildQuarterlyTariffMatrix", () => {
  test("sorts time ranges chronologically and pushes catch-all entries to the end", () => {
    const matrix = buildQuarterlyTariffMatrix({
      bands: [
        { key: "NT", label: "Niedrigtarif", valueCtPerKwh: "1.00" },
        { key: "ST", label: "Standardtarif", valueCtPerKwh: "5.00" },
        { key: "HT", label: "Hochtarif", valueCtPerKwh: "8.00" }
      ],
      timeWindows: [
        {
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 2026",
          timeRangeLabel: "22:00-24:00",
          sourceQuote: "ST 22:00-24:00"
        },
        {
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 2026",
          timeRangeLabel: "Alle anderen Zeiten",
          sourceQuote: "ST alle anderen Zeiten"
        },
        {
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 2026",
          timeRangeLabel: "07:00-10:00",
          sourceQuote: "ST 07:00-10:00"
        },
        {
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 2026",
          timeRangeLabel: "00:00-07:00",
          sourceQuote: "ST 00:00-07:00"
        }
      ]
    });

    expect(matrix.find((quarter) => quarter.key === "Q1")?.groups).toEqual([
      expect.objectContaining({
        bandKey: "ST",
        timeRanges: ["00:00-07:00", "07:00-10:00", "22:00-24:00", "Alle anderen Zeiten"]
      })
    ]);
  });

  test("renders Stadtwerke Schwäbisch Hall quarter logic from the official 2026 PDF", () => {
    const operator = getSeedPublishedOperators().find(
      (entry) => entry.slug === "stadtwerke-schwaebisch-hall"
    );

    expect(operator).toBeDefined();

    const matrix = buildQuarterlyTariffMatrix(operator!);
    const q1 = matrix.find((quarter) => quarter.key === "Q1");
    const q3 = matrix.find((quarter) => quarter.key === "Q3");

    expect(q1?.groups).toEqual([
      expect.objectContaining({
        bandKey: "ST",
        valueCtPerKwh: "5.53",
        timeRanges: ["07:00-10:00", "14:00-18:00", "20:00-22:00"]
      }),
      expect.objectContaining({
        bandKey: "HT",
        valueCtPerKwh: "8.14",
        timeRanges: ["10:00-14:00", "18:00-20:00"]
      }),
      expect.objectContaining({
        bandKey: "NT",
        valueCtPerKwh: "1.11",
        timeRanges: ["00:00-07:00", "22:00-00:00"]
      })
    ]);

    expect(q3).toEqual({
      key: "Q3",
      label: "Q3",
      summaryLabel: "Nur Standardtarif",
      groups: [
        expect.objectContaining({
          bandKey: "ST",
          valueCtPerKwh: "5.53",
          timeRanges: ["00:00-24:00"]
        })
      ],
      timelineEntries: [
        expect.objectContaining({
          bandKey: "ST",
          valueCtPerKwh: "5.53",
          timeRange: "00:00-24:00"
        })
      ]
    });
  });

  test("attaches a quarter matrix to published tariff rows", () => {
    const rows = getRegistryTariffRows(getSeedPublishedOperators());
    const schwaebischHall = rows.find((row) => row.operatorSlug === "stadtwerke-schwaebisch-hall");

    expect(schwaebischHall?.quarterMatrix).toHaveLength(4);
    expect(schwaebischHall?.currentBandBadges).toEqual([
      { key: "NT", valueCtPerKwh: "1.11" },
      { key: "ST", valueCtPerKwh: "5.53" },
      { key: "HT", valueCtPerKwh: "8.14" }
    ]);
    expect(
      schwaebischHall?.quarterMatrix.find((quarter) => quarter.key === "Q3")?.summaryLabel
    ).toBe("Nur Standardtarif");
  });
});
