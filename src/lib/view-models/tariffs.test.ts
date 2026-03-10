import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../../modules/operators/current-catalog";
import type { CurrentSource } from "../../modules/sources/current-sources";
import { getSeedEndcustomerTariffCatalog } from "../../modules/tariffs/endcustomer-catalog";
import {
  buildQuarterlyTariffMatrix,
  expandSeasonLabelToQuarters,
  getComplianceRuleSetDisplay,
  getRegistryTariffRows,
  mergeTariffRowsWithCurrentSources,
  mergeTariffRowsWithEndcustomerCatalog
} from "./tariffs";
import { getActiveModul3RuleSet } from "../../modules/compliance/rule-catalog";

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
  test("sorts time ranges chronologically, fills quarter slots, and compresses adjacent slots into segments", () => {
    const matrix = buildQuarterlyTariffMatrix({
      bands: [
        { key: "NT", label: "Niedrigtarif", valueCtPerKwh: "1.00" },
        { key: "ST", label: "Standardtarif", valueCtPerKwh: "5.00" },
        { key: "HT", label: "Hochtarif", valueCtPerKwh: "8.00" }
      ],
      timeWindows: [
        {
          bandKey: "HT",
          label: "Hochtarif",
          seasonLabel: "Q1 2026",
          timeRangeLabel: "22:00-24:00",
          sourceQuote: "HT 22:00-24:00"
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
          bandKey: "NT",
          label: "Niedrigtarif",
          seasonLabel: "Q1 2026",
          timeRangeLabel: "00:00-07:00",
          sourceQuote: "NT 00:00-07:00"
        }
      ]
    });

    const q1 = matrix.find((quarter) => quarter.key === "Q1");

    expect(q1?.groups).toEqual([
      expect.objectContaining({
        bandKey: "ST",
        timeRanges: ["07:00-10:00", "Alle anderen Zeiten"]
      }),
      expect.objectContaining({
        bandKey: "HT",
        timeRanges: ["22:00-24:00"]
      }),
      expect.objectContaining({
        bandKey: "NT",
        timeRanges: ["00:00-07:00"]
      })
    ]);

    expect(q1?.slots).toHaveLength(96);
    expect(q1?.slots[0]).toEqual(
      expect.objectContaining({
        slotIndex: 0,
        startLabel: "00:00",
        endLabel: "00:15",
        timeLabel: "00:00-00:15",
        bandKey: "NT",
        valueCtPerKwh: "1.00",
        isHourStart: true
      })
    );
    expect(q1?.slots[28]).toEqual(
      expect.objectContaining({
        startLabel: "07:00",
        timeLabel: "07:00-07:15",
        bandKey: "ST",
        valueCtPerKwh: "5.00",
        isHourStart: true
      })
    );
    expect(q1?.slots[40]).toEqual(
      expect.objectContaining({
        startLabel: "10:00",
        timeLabel: "10:00-10:15",
        bandKey: "ST",
        valueCtPerKwh: "5.00"
      })
    );
    expect(q1?.slots[88]).toEqual(
      expect.objectContaining({
        startLabel: "22:00",
        timeLabel: "22:00-22:15",
        bandKey: "HT",
        valueCtPerKwh: "8.00",
        isHourStart: true
      })
    );
    expect(q1?.segments).toEqual([
      expect.objectContaining({
        startLabel: "00:00",
        endLabel: "07:00",
        timeLabel: "00:00-07:00",
        bandKey: "NT",
        valueCtPerKwh: "1.00"
      }),
      expect.objectContaining({
        startLabel: "07:00",
        endLabel: "22:00",
        timeLabel: "07:00-22:00",
        bandKey: "ST",
        valueCtPerKwh: "5.00"
      }),
      expect.objectContaining({
        startLabel: "22:00",
        endLabel: "24:00",
        timeLabel: "22:00-24:00",
        bandKey: "HT",
        valueCtPerKwh: "8.00"
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
      coverageStatus: "official",
      groups: [
        expect.objectContaining({
          bandKey: "ST",
          valueCtPerKwh: "5.53",
          timeRanges: ["00:00-24:00"],
          coverageStatus: "official"
        })
      ],
      timelineEntries: [
        expect.objectContaining({
          bandKey: "ST",
          valueCtPerKwh: "5.53",
          timeRange: "00:00-24:00"
        })
      ],
      slots: expect.arrayContaining([
        expect.objectContaining({
          slotIndex: 0,
          timeLabel: "00:00-00:15",
          bandKey: "ST",
          valueCtPerKwh: "5.53",
          isHourStart: true,
          coverageStatus: "official"
        }),
        expect.objectContaining({
          slotIndex: 95,
          timeLabel: "23:45-24:00",
          bandKey: "ST",
          valueCtPerKwh: "5.53",
          isHourStart: false,
          coverageStatus: "official"
        })
      ]),
      segments: [
        expect.objectContaining({
          startLabel: "00:00",
          endLabel: "24:00",
          timeLabel: "00:00-24:00",
          bandKey: "ST",
          valueCtPerKwh: "5.53",
          coverageStatus: "official"
        })
      ]
    });
    expect(q3?.slots).toHaveLength(96);
    expect(q3?.segments).toEqual([
      expect.objectContaining({
        startLabel: "00:00",
        endLabel: "24:00",
        timeLabel: "00:00-24:00",
        bandKey: "ST",
        valueCtPerKwh: "5.53"
      })
    ]);
    expect(q1?.segments).toHaveLength(7);
    expect(q1?.slots[40]).toEqual(
      expect.objectContaining({
        timeLabel: "10:00-10:15",
        bandKey: "HT",
        valueCtPerKwh: "8.14"
      })
    );
    expect(q1?.slots[95]).toEqual(
      expect.objectContaining({
        timeLabel: "23:45-24:00",
        bandKey: "NT",
        valueCtPerKwh: "1.11"
      })
    );
  });

  test("keeps wrap-around night windows after midnight instead of truncating them at 24:00", () => {
    const matrix = buildQuarterlyTariffMatrix({
      bands: [
        { key: "NT", label: "Niedrigtarif", valueCtPerKwh: "1.01" },
        { key: "ST", label: "Standardtarif", valueCtPerKwh: "6.72" },
        { key: "HT", label: "Hochtarif", valueCtPerKwh: "7.86" }
      ],
      timeWindows: [
        {
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 und Q4 2026",
          timeRangeLabel: "06:00-16:45",
          sourceQuote: "ST 06:00-16:45"
        },
        {
          bandKey: "HT",
          label: "Hochtarif",
          seasonLabel: "Q1 und Q4 2026",
          timeRangeLabel: "16:45-20:00",
          sourceQuote: "HT 16:45-20:00"
        },
        {
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q1 und Q4 2026",
          timeRangeLabel: "20:00-22:00",
          sourceQuote: "ST 20:00-22:00"
        },
        {
          bandKey: "NT",
          label: "Niedrigtarif",
          seasonLabel: "Q1 und Q4 2026",
          timeRangeLabel: "22:00-06:00",
          sourceQuote: "NT 22:00-06:00"
        },
        {
          bandKey: "ST",
          label: "Standardtarif",
          seasonLabel: "Q2-Q3 2026",
          timeRangeLabel: "00:00-24:00",
          sourceQuote: "Q2/Q3 ST 00:00-24:00"
        }
      ]
    });

    const q1 = matrix.find((quarter) => quarter.key === "Q1");
    const q2 = matrix.find((quarter) => quarter.key === "Q2");

    expect(q1?.slots[0]).toEqual(
      expect.objectContaining({
        timeLabel: "00:00-00:15",
        bandKey: "NT",
        valueCtPerKwh: "1.01"
      })
    );
    expect(q1?.slots[23]).toEqual(
      expect.objectContaining({
        timeLabel: "05:45-06:00",
        bandKey: "NT",
        valueCtPerKwh: "1.01"
      })
    );
    expect(q1?.slots[24]).toEqual(
      expect.objectContaining({
        timeLabel: "06:00-06:15",
        bandKey: "ST",
        valueCtPerKwh: "6.72"
      })
    );
    expect(q1?.slots[88]).toEqual(
      expect.objectContaining({
        timeLabel: "22:00-22:15",
        bandKey: "NT",
        valueCtPerKwh: "1.01"
      })
    );
    expect(q2?.summaryLabel).toBe("Nur Standardtarif");
    expect(q2?.slots[0]).toEqual(
      expect.objectContaining({
        timeLabel: "00:00-00:15",
        bandKey: "ST",
        valueCtPerKwh: "6.72"
      })
    );
    expect(q2?.slots[95]).toEqual(
      expect.objectContaining({
        timeLabel: "23:45-24:00",
        bandKey: "ST",
        valueCtPerKwh: "6.72"
      })
    );
  });

  test("attaches a quarter matrix to published tariff rows", () => {
    const rows = getRegistryTariffRows(getSeedPublishedOperators());
    const schwaebischHall = rows.find((row) => row.operatorSlug === "stadtwerke-schwaebisch-hall");
    const netzeBw = rows.find((row) => row.operatorSlug === "netze-bw");

    expect(schwaebischHall?.quarterMatrix).toHaveLength(4);
    expect(schwaebischHall?.currentBandBadges).toEqual([
      { key: "NT", valueCtPerKwh: "1.11", priceBasis: "assumed-netto" },
      { key: "ST", valueCtPerKwh: "5.53", priceBasis: "assumed-netto" },
      { key: "HT", valueCtPerKwh: "8.14", priceBasis: "assumed-netto" }
    ]);
    expect(
      schwaebischHall?.quarterMatrix.find((quarter) => quarter.key === "Q3")?.summaryLabel
    ).toBe("Nur Standardtarif");
    expect(schwaebischHall?.compliance.status).toBe("compliant");
    expect(netzeBw?.compliance.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "nt_between_10_and_40_percent_of_st"
        })
      ])
    );
  });

  test("projects the active compliance rule set for the UI", () => {
    const display = getComplianceRuleSetDisplay(getActiveModul3RuleSet());

    expect(display).toMatchObject({
      ruleSetId: "bdew-modul-3-v1-1",
      title: "BDEW Anwendungshilfe Modul 3",
      sourceDocumentUrl:
        "https://www.bdew.de/media/documents/BDEW-AWH_Modul_3_V1.1_Korrektur070225.pdf"
    });
    expect(display.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "ht_min_2h_per_day",
          title: "HT mindestens 2 Stunden pro Tag"
        })
      ])
    );
  });

  test("fills MVV Q2 and Q3 with an explicitly marked assumed standard tariff", () => {
    const rows = getRegistryTariffRows(getSeedPublishedOperators());
    const mvv = rows.find((row) => row.operatorSlug === "mvv-netze");
    const q2 = mvv?.quarterMatrix.find((quarter) => quarter.key === "Q2");
    const q3 = mvv?.quarterMatrix.find((quarter) => quarter.key === "Q3");

    expect(q2).toEqual(
      expect.objectContaining({
        summaryLabel: "Quelle ohne Zeitfenster",
        coverageStatus: "assumed-st"
      })
    );
    expect(q2?.segments).toEqual([
      expect.objectContaining({
        timeLabel: "00:00-24:00",
        bandKey: "ST",
        valueCtPerKwh: "4.32",
        coverageStatus: "assumed-st"
      })
    ]);
    expect(q3).toEqual(
      expect.objectContaining({
        summaryLabel: "Quelle ohne Zeitfenster",
        coverageStatus: "assumed-st"
      })
    );
  });

  test("does not leave unresolved empty quarter slots after assumed standard fallback", () => {
    const rows = getRegistryTariffRows(getSeedPublishedOperators());
    const issues = rows.flatMap((row) =>
      row.quarterMatrix.flatMap((quarter) => {
        const nullSlots = quarter.slots.filter((slot) => slot.bandKey === null).length;

        return nullSlots > 0 ? [{ operatorSlug: row.operatorSlug, quarter: quarter.key, nullSlots }] : [];
      })
    );

    expect(issues).toEqual([]);
  });

  test("merges current source metadata by exact source slug instead of operator slug", () => {
    const row = getRegistryTariffRows(getSeedPublishedOperators()).find(
      (entry) => entry.operatorSlug === "stadtwerke-schwaebisch-hall"
    );

    const sources: CurrentSource[] = [
      {
        sourceCatalogId: "wrong-source",
        sourceSlug: "stadtwerke-schwaebisch-hall-other-source",
        operatorSlug: "stadtwerke-schwaebisch-hall",
        operatorName: "Stadtwerke Schwäbisch Hall GmbH",
        pageUrl: "https://example.com/wrong-page",
        documentUrl: "https://example.com/wrong.pdf",
        reviewStatus: "verified",
        checkedAt: "2026-03-09",
        lastSuccessfulAt: "2026-03-09",
        latestPageSnapshotFetchedAt: "2026-03-09T10:00:00.000Z",
        latestPageSnapshotHash: "wrong-page-hash",
        latestPageSnapshotStoragePath: "artifacts/wrong-page.html",
        pageArtifactApiUrl: "/api/artifacts/wrong-page.html",
        latestDocumentSnapshotFetchedAt: "2026-03-09T10:10:00.000Z",
        latestDocumentSnapshotHash: "wrong-doc-hash",
        latestDocumentSnapshotStoragePath: "artifacts/wrong-doc.pdf",
        documentArtifactApiUrl: "/api/artifacts/wrong-doc.pdf",
        healthReport: {
          status: "warning",
          issues: [{ key: "snapshot_missing", message: "wrong source" }]
        }
      },
      {
        sourceCatalogId: "correct-source",
        sourceSlug: row!.sourceSlug,
        operatorSlug: "stadtwerke-schwaebisch-hall",
        operatorName: "Stadtwerke Schwäbisch Hall GmbH",
        pageUrl: row!.sourcePageUrl,
        documentUrl: row!.documentUrl,
        reviewStatus: "verified",
        checkedAt: "2026-03-09",
        lastSuccessfulAt: "2026-03-09",
        latestPageSnapshotFetchedAt: "2026-03-09T11:00:00.000Z",
        latestPageSnapshotHash: "correct-page-hash",
        latestPageSnapshotStoragePath: "artifacts/correct-page.html",
        pageArtifactApiUrl: "/api/artifacts/correct-page.html",
        latestDocumentSnapshotFetchedAt: "2026-03-09T11:10:00.000Z",
        latestDocumentSnapshotHash: "correct-doc-hash",
        latestDocumentSnapshotStoragePath: "artifacts/correct-doc.pdf",
        documentArtifactApiUrl: "/api/artifacts/correct-doc.pdf",
        healthReport: {
          status: "ok",
          issues: []
        }
      }
    ];

    const merged = mergeTariffRowsWithCurrentSources([row!], sources)[0];

    expect(merged.latestPageSnapshotHash).toBe("correct-page-hash");
    expect(merged.latestDocumentSnapshotHash).toBe("correct-doc-hash");
    expect(merged.pageArtifactApiUrl).toBe("/api/artifacts/correct-page.html");
    expect(merged.documentArtifactApiUrl).toBe("/api/artifacts/correct-doc.pdf");
    expect(merged.sourceHealthReport?.status).toBe("ok");
  });

  test("does not render an endcustomer display for incomplete or unverified product sets", () => {
    const row = getRegistryTariffRows(getSeedPublishedOperators()).find(
      (entry) => entry.operatorSlug === "stadtwerke-schwaebisch-hall"
    );
    const reference = getSeedEndcustomerTariffCatalog()[0]!;

    const incompleteCatalog = [
      {
        ...reference,
        products: reference.products.map((product) =>
          product.moduleKey === "modul-2"
            ? { ...product, components: product.components.filter((component) => component.componentKey !== "work_price_ct_per_kwh") }
            : product
        )
      }
    ];

    const unverifiedCatalog = [
      {
        ...reference,
        products: reference.products.map((product) => ({
          ...product,
          humanReviewStatus: "pending"
        }))
      }
    ];

    const missingRequirementCatalog = [
      {
        ...reference,
        products: reference.products.map((product) =>
          product.moduleKey === "modul-1"
            ? {
                ...product,
                requirements: product.requirements.filter(
                  (requirement) => requirement.requirementKey !== "default_if_no_choice"
                )
              }
            : product
        )
      }
    ];

    expect(mergeTariffRowsWithEndcustomerCatalog([row!], incompleteCatalog)[0]?.endcustomerDisplay).toBeNull();
    expect(mergeTariffRowsWithEndcustomerCatalog([row!], unverifiedCatalog)[0]?.endcustomerDisplay).toBeNull();
    expect(mergeTariffRowsWithEndcustomerCatalog([row!], missingRequirementCatalog)[0]?.endcustomerDisplay).toBeNull();
  });
});
