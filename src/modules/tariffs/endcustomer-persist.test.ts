import { describe, expect, test, vi } from "vitest";

import { getStadtwerkeSchwaebischHallEndcustomerReference } from "./endcustomer-reference";
import {
  buildEndcustomerPersistencePayload,
  persistEndcustomerReference
} from "./endcustomer-persist";

describe("buildEndcustomerPersistencePayload", () => {
  test("flattens the schwäbisch hall reference into products, components, requirements and windows", () => {
    const payload = buildEndcustomerPersistencePayload({
      operatorSlug: "stadtwerke-schwaebisch-hall",
      operatorId: "operator-1",
      sourceCatalogId: "source-1",
      reference: getStadtwerkeSchwaebischHallEndcustomerReference()
    });

    expect(payload.products).toHaveLength(3);
    expect(payload.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "modul-1",
          componentKey: "net_fee_reduction_eur_per_year",
          valueNumeric: "108.70"
        }),
        expect.objectContaining({
          moduleKey: "modul-3",
          componentKey: "high_work_price_ct_per_kwh",
          valueNumeric: "8.14"
        })
      ])
    );
    expect(payload.requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "modul-2",
          requirementKey: "separate_market_location_required",
          requirementValue: "true"
        })
      ])
    );
    expect(payload.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "modul-3",
          quarterKey: "Q3",
          bandKey: "standard",
          startsAt: "00:00",
          endsAt: "24:00"
        })
      ])
    );
  });
});

describe("persistEndcustomerReference", () => {
  test("replaces one operator slice and records an ingest run", async () => {
    const gateway = {
      replaceOperatorProducts: vi.fn(async () => undefined),
      insertRun: vi.fn(async () => undefined)
    };

    const summary = await persistEndcustomerReference({
      gateway,
      operatorSlug: "stadtwerke-schwaebisch-hall",
      payload: buildEndcustomerPersistencePayload({
        operatorSlug: "stadtwerke-schwaebisch-hall",
        operatorId: "operator-1",
        sourceCatalogId: "source-1",
        reference: getStadtwerkeSchwaebischHallEndcustomerReference()
      })
    });

    expect(gateway.replaceOperatorProducts).toHaveBeenCalledWith(
      "stadtwerke-schwaebisch-hall",
      expect.objectContaining({
        products: expect.any(Array),
        components: expect.any(Array),
        requirements: expect.any(Array),
        timeWindows: expect.any(Array)
      })
    );
    expect(gateway.insertRun).toHaveBeenCalledWith({
      runType: "endcustomer-reference-import",
      status: "success",
      summary
    });
    expect(summary).toEqual({
      operatorSlug: "stadtwerke-schwaebisch-hall",
      productCount: 3,
      componentCount: 8,
      requirementCount: 6,
      timeWindowCount: 22
    });
  });
});
