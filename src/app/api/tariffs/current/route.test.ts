import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/current", () => {
  test("returns current tariff payload with source metadata and modul-3 bands", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/current"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      operatorSlug: expect.any(String),
      sourceSlug: expect.any(String),
      sourcePageUrl: expect.any(String),
      documentUrl: expect.any(String),
      checkedAt: expect.any(String),
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: expect.any(String)
        })
      ]),
      timeWindows: expect.any(Array)
    });

    const nErgie = data.items.find((item: { operatorSlug: string }) => item.operatorSlug === "n-ergie-netz");

    expect(nErgie).toMatchObject({
      timeWindows: expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "18:00-21:00"
        })
      ])
    });

    const eDisNetz = data.items.find(
      (item: { operatorSlug: string }) => item.operatorSlug === "e-dis-netz"
    );

    expect(eDisNetz).toMatchObject({
      reviewStatus: "verified",
      timeWindows: expect.arrayContaining([
        expect.objectContaining({
          bandKey: "HT",
          timeRangeLabel: "16:45-20:15"
        })
      ])
    });
  });
});
