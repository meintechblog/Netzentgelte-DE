import { describe, expect, test } from "vitest";

import {
  buildEndcustomerTariffCatalog,
  getSeedEndcustomerTariffCatalog,
  shouldUseSeedEndcustomerTariffs
} from "./endcustomer-catalog";

describe("buildEndcustomerTariffCatalog", () => {
  test("groups flat rows into product-centric endcustomer tariff records", () => {
    const catalog = buildEndcustomerTariffCatalog([
      {
        operatorSlug: "stadtwerke-schwaebisch-hall",
        operatorName: "Stadtwerke Schwaebisch Hall GmbH",
        moduleKey: "modul-1",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: "2026-01-01",
        sourceDocumentUrl:
          "https://stadtwerke-hall.de/fileadmin/files/Downloads/Netzdaten_Strom/4_Netzentgelte/4NNE_STW-SHA_ab_01.01.2026.pdf",
        humanReviewStatus: "verified",
        componentKey: "base_price_eur_per_year",
        componentValueNumeric: "61.00",
        componentUnit: "EUR/a",
        requirementKey: "default_if_no_choice",
        requirementValue: "true",
        quarterKey: null,
        bandKey: null,
        startsAt: null,
        endsAt: null
      },
      {
        operatorSlug: "stadtwerke-schwaebisch-hall",
        operatorName: "Stadtwerke Schwaebisch Hall GmbH",
        moduleKey: "modul-3",
        networkLevel: "niederspannung",
        meteringMode: "slp",
        validFrom: "2026-01-01",
        sourceDocumentUrl:
          "https://stadtwerke-hall.de/fileadmin/files/Downloads/Netzdaten_Strom/4_Netzentgelte/4NNE_STW-SHA_ab_01.01.2026.pdf",
        humanReviewStatus: "verified",
        componentKey: "standard_work_price_ct_per_kwh",
        componentValueNumeric: "5.53",
        componentUnit: "ct/kWh",
        requirementKey: "intelligent_meter_required",
        requirementValue: "true",
        quarterKey: "Q3",
        bandKey: "standard",
        startsAt: "00:00",
        endsAt: "24:00"
      }
    ]);

    expect(catalog).toEqual([
      expect.objectContaining({
        operatorSlug: "stadtwerke-schwaebisch-hall",
        products: expect.arrayContaining([
          expect.objectContaining({
            moduleKey: "modul-1",
            components: expect.arrayContaining([
              expect.objectContaining({
                componentKey: "base_price_eur_per_year",
                valueNumeric: "61.00"
              })
            ])
          }),
          expect.objectContaining({
            moduleKey: "modul-3",
            timeWindows: [
              expect.objectContaining({
                quarterKey: "Q3",
                bandKey: "standard",
                startsAt: "00:00",
                endsAt: "24:00"
              })
            ]
          })
        ])
      })
    ]);
  });
});

describe("getSeedEndcustomerTariffCatalog", () => {
  test("exposes the schwäbisch hall reference fixture as seed-backed catalog", () => {
    const catalog = getSeedEndcustomerTariffCatalog();
    const hall = catalog.find((entry) => entry.operatorSlug === "stadtwerke-schwaebisch-hall");

    expect(hall).toMatchObject({
      operatorSlug: "stadtwerke-schwaebisch-hall",
      products: expect.arrayContaining([
        expect.objectContaining({
          moduleKey: "modul-2",
          components: expect.arrayContaining([
            expect.objectContaining({
              componentKey: "work_price_ct_per_kwh",
              valueNumeric: "2.21"
            })
          ])
        })
      ])
    });
  });
});

describe("shouldUseSeedEndcustomerTariffs", () => {
  test("uses seed data in test mode and without a database url", () => {
    expect(shouldUseSeedEndcustomerTariffs({ nodeEnv: "test", databaseUrl: "postgres://example" })).toBe(true);
    expect(shouldUseSeedEndcustomerTariffs({ nodeEnv: "production", databaseUrl: undefined })).toBe(true);
    expect(shouldUseSeedEndcustomerTariffs({ nodeEnv: "production", databaseUrl: "postgres://example" })).toBe(
      false
    );
  });
});
