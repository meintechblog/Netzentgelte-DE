import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/endcustomer/current", () => {
  test("returns the current low-voltage endcustomer product catalog", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/endcustomer/current"));
    const data = await response.json();
    const netzeBw = data.items.find((item: { operatorSlug: string }) => item.operatorSlug === "netze-bw");
    const stromnetzBerlin = data.items.find(
      (item: { operatorSlug: string }) => item.operatorSlug === "stromnetz-berlin"
    );

    const hall = data.items.find(
      (item: { operatorSlug: string }) => item.operatorSlug === "stadtwerke-schwaebisch-hall"
    );

    expect(data.summary).toMatchObject({
      operatorCount: 12
    });
    expect(hall).toMatchObject({
      operatorSlug: "stadtwerke-schwaebisch-hall",
      meteringPrices: expect.arrayContaining([
        expect.objectContaining({
          componentKey: "single_register_meter_eur_per_year",
          valueNumeric: "9.50"
        })
      ]),
      products: expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "modul-1",
          components: expect.arrayContaining([
            expect.objectContaining({
              componentKey: "net_fee_reduction_eur_per_year",
              valueNumeric: "108.70"
            })
          ])
        }),
        expect.objectContaining({
          moduleKey: "modul-3",
          timeWindows: expect.arrayContaining([
            expect.objectContaining({
              quarterKey: "Q3",
              bandKey: "standard",
              startsAt: "00:00",
              endsAt: "24:00"
            })
          ])
        })
      ])
    });
    expect(netzeBw).toMatchObject({
      operatorSlug: "netze-bw",
      meteringPrices: expect.arrayContaining([
        expect.objectContaining({
          componentKey: "single_register_meter_eur_per_year",
          valueNumeric: "10.67"
        })
      ])
    });
    expect(stromnetzBerlin).toMatchObject({
      operatorSlug: "stromnetz-berlin",
      products: expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "modul-3",
          components: expect.arrayContaining([
            expect.objectContaining({
              componentKey: "high_work_price_ct_per_kwh",
              valueNumeric: "13.94"
            })
          ])
        })
      ])
    });
  });
});
