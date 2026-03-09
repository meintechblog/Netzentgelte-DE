import { describe, expect, test } from "vitest";

import {
  getSeedEndcustomerReferences,
  getStadtwerkeSchwaebischHallEndcustomerReference
} from "./endcustomer-reference";

describe("getStadtwerkeSchwaebischHallEndcustomerReference", () => {
  test("captures modul 1, 2 and 3 for low-voltage endcustomer products", () => {
    const reference = getStadtwerkeSchwaebischHallEndcustomerReference();
    const modul1 = reference.products.find((product) => product.moduleKey === "modul-1");
    const modul2 = reference.products.find((product) => product.moduleKey === "modul-2");
    const modul3 = reference.products.find((product) => product.moduleKey === "modul-3");

    expect(reference.operatorSlug).toBe("stadtwerke-schwaebisch-hall");
    expect(modul1?.networkLevel).toBe("niederspannung");
    expect(modul2?.networkLevel).toBe("niederspannung");
    expect(modul3?.networkLevel).toBe("niederspannung");
  });

  test("captures the monetary components from the 2026 pdf", () => {
    const reference = getStadtwerkeSchwaebischHallEndcustomerReference();
    const modul1 = reference.products.find((product) => product.moduleKey === "modul-1");
    const modul2 = reference.products.find((product) => product.moduleKey === "modul-2");
    const modul3 = reference.products.find((product) => product.moduleKey === "modul-3");

    expect(modul1?.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "base_price_eur_per_year", valueNumeric: "61.00" }),
        expect.objectContaining({ componentKey: "work_price_ct_per_kwh", valueNumeric: "5.53" }),
        expect.objectContaining({
          componentKey: "net_fee_reduction_eur_per_year",
          valueNumeric: "108.70"
        })
      ])
    );
    expect(modul2?.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "base_price_eur_per_year", valueNumeric: "0.00" }),
        expect.objectContaining({ componentKey: "work_price_ct_per_kwh", valueNumeric: "2.21" })
      ])
    );
    expect(modul3?.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "standard_work_price_ct_per_kwh", valueNumeric: "5.53" }),
        expect.objectContaining({ componentKey: "high_work_price_ct_per_kwh", valueNumeric: "8.14" }),
        expect.objectContaining({ componentKey: "low_work_price_ct_per_kwh", valueNumeric: "1.11" })
      ])
    );
  });

  test("captures the q3-only standard tariff rule and metering prices", () => {
    const reference = getStadtwerkeSchwaebischHallEndcustomerReference();
    const modul3 = reference.products.find((product) => product.moduleKey === "modul-3");

    expect(modul3?.timeWindows.filter((window) => window.quarterKey === "Q3")).toEqual([
      expect.objectContaining({
        quarterKey: "Q3",
        bandKey: "standard",
        startsAt: "00:00",
        endsAt: "24:00"
      })
    ]);
    expect(reference.meteringPrices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "single_register_meter_eur_per_year", valueNumeric: "9.50" }),
        expect.objectContaining({ componentKey: "dual_register_meter_eur_per_year", valueNumeric: "14.75" })
      ])
    );
  });
});

describe("getSeedEndcustomerReferences", () => {
  test("includes the next source-backed operator batch beyond Schwäbisch Hall", () => {
    expect(getSeedEndcustomerReferences().map((reference) => reference.operatorSlug)).toEqual(
      expect.arrayContaining([
        "stadtwerke-schwaebisch-hall",
        "netze-bw",
        "stromnetz-berlin",
        "netze-odr",
        "mitnetz-strom",
        "allgaeunetz",
        "mainzer-netze"
      ])
    );
  });

  test("captures endcustomer module data for AllgaeuNetz and Mainzer Netze", () => {
    const references = new Map(
      getSeedEndcustomerReferences().map((reference) => [reference.operatorSlug, reference] as const)
    );

    const allgaeu = references.get("allgaeunetz");
    const mainzer = references.get("mainzer-netze");

    expect(allgaeu?.products.find((product) => product.moduleKey === "modul-1")?.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "base_price_eur_per_year", valueNumeric: "96.00" }),
        expect.objectContaining({ componentKey: "work_price_ct_per_kwh", valueNumeric: "8.63" }),
        expect.objectContaining({
          componentKey: "net_fee_reduction_eur_per_year",
          valueNumeric: "131.95"
        })
      ])
    );
    expect(allgaeu?.meteringPrices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "single_register_meter_eur_per_year", valueNumeric: "10.75" }),
        expect.objectContaining({ componentKey: "dual_register_meter_eur_per_year", valueNumeric: "20.30" })
      ])
    );

    expect(mainzer?.products.find((product) => product.moduleKey === "modul-2")?.components).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "base_price_eur_per_year", valueNumeric: "0.00" }),
        expect.objectContaining({ componentKey: "work_price_ct_per_kwh", valueNumeric: "2.69" })
      ])
    );
    expect(mainzer?.products.find((product) => product.moduleKey === "modul-3")?.timeWindows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ quarterKey: "Q2", bandKey: "standard", startsAt: "00:00", endsAt: "24:00" }),
        expect.objectContaining({ quarterKey: "Q4", bandKey: "low", startsAt: "22:00", endsAt: "06:00" })
      ])
    );
    expect(mainzer?.meteringPrices).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ componentKey: "single_register_meter_eur_per_year", valueNumeric: "15.90" }),
        expect.objectContaining({ componentKey: "dual_register_meter_eur_per_year", valueNumeric: "19.90" })
      ])
    );
  });
});
