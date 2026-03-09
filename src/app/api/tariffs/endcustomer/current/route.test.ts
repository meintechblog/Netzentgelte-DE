import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/endcustomer/current", () => {
  test("returns the current low-voltage endcustomer product catalog", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/endcustomer/current"));
    const data = await response.json();

    const hall = data.items.find(
      (item: { operatorSlug: string }) => item.operatorSlug === "stadtwerke-schwaebisch-hall"
    );

    expect(hall).toMatchObject({
      operatorSlug: "stadtwerke-schwaebisch-hall",
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
  });
});
