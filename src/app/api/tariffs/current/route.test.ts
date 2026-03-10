import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/current", () => {
  test("returns current tariff payload with source metadata, price basis and compliance", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/current"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      operatorSlug: expect.any(String),
      sourceSlug: expect.any(String),
      sourcePageUrl: expect.any(String),
      documentUrl: expect.any(String),
      checkedAt: expect.any(String),
      priceBasis: expect.any(String),
      compliance: expect.objectContaining({
        ruleSetId: expect.any(String),
        status: expect.any(String),
        violations: expect.any(Array)
      }),
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: expect.any(String)
        })
      ]),
      timeWindows: expect.any(Array)
    });

    const nErgie = data.items.find((item: { operatorSlug: string }) => item.operatorSlug === "n-ergie-netz");
    const eDisNetz = data.items.find(
      (item: { operatorSlug: string }) => item.operatorSlug === "e-dis-netz"
    );
    const schwaebischHall = data.items.find(
      (item: { operatorSlug: string }) => item.operatorSlug === "stadtwerke-schwaebisch-hall"
    );

    expect(nErgie).toMatchObject({
      timeWindows: expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "18:00-21:00"
        })
      ])
    });
    expect(eDisNetz).toMatchObject({
      reviewStatus: "verified",
      timeWindows: expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "16:45-20:15"
        })
      ])
    });
    expect(
      data.items.find((item: { operatorSlug: string }) => item.operatorSlug === "avacon-netz")
    ).toMatchObject({
      reviewStatus: "verified",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "8.41"
        })
      ])
    });
    expect(
      data.items.find((item: { operatorSlug: string }) => item.operatorSlug === "nordnetz")
    ).toMatchObject({
      reviewStatus: "verified",
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: "HT",
          valueCtPerKwh: "5.21"
        })
      ])
    });
    expect(schwaebischHall).toMatchObject({
      reviewStatus: "verified",
      priceBasis: "assumed-netto",
      compliance: expect.objectContaining({
        status: "compliant"
      }),
      timeWindows: expect.arrayContaining([
        expect.objectContaining({
          seasonLabel: "Q3 2026",
          bandKey: "ST",
          timeRangeLabel: "00:00-24:00"
        })
      ])
    });
  });
});
