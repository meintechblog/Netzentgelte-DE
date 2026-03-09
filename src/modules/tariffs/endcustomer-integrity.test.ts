import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../operators/current-catalog";
import { getSeedEndcustomerTariffCatalog } from "./endcustomer-catalog";
import {
  buildEndcustomerIntegrityAudit,
  getEndcustomerIntegrityAuditSummary,
  getNextEndcustomerBackfillTargets,
  selectCurrentCompleteEndcustomerSet
} from "./endcustomer-integrity";

describe("selectCurrentCompleteEndcustomerSet", () => {
  test("selects the verified complete Schwäbisch-Hall product set", () => {
    const entry = getSeedEndcustomerTariffCatalog()[0];

    const selected = selectCurrentCompleteEndcustomerSet(entry!);

    expect(selected).toMatchObject({
      validFrom: "2026-01-01",
      modul1: expect.objectContaining({ moduleKey: "modul-1" }),
      modul2: expect.objectContaining({ moduleKey: "modul-2" }),
      modul3: expect.objectContaining({ moduleKey: "modul-3" })
    });
  });

  test("rejects entries that are missing required requirements or metering prices", () => {
    const entry = getSeedEndcustomerTariffCatalog()[0]!;

    const missingRequirement = {
      ...entry,
      products: entry.products.map((product) =>
        product.moduleKey === "modul-2"
          ? {
              ...product,
              requirements: product.requirements.filter(
                (requirement) => requirement.requirementKey !== "separate_meter_required"
              )
            }
          : product
      )
    };

    const missingMetering = {
      ...entry,
      meteringPrices: entry.meteringPrices.filter(
        (component) => component.componentKey !== "dual_register_meter_eur_per_year"
      )
    };

    expect(selectCurrentCompleteEndcustomerSet(missingRequirement)).toBeNull();
    expect(selectCurrentCompleteEndcustomerSet(missingMetering)).toBeNull();
  });
});

describe("buildEndcustomerIntegrityAudit", () => {
  test("reports complete and missing published operators", () => {
    const audit = buildEndcustomerIntegrityAudit(
      getSeedPublishedOperators(),
      getSeedEndcustomerTariffCatalog()
    );

    const hall = audit.find((item) => item.operatorSlug === "stadtwerke-schwaebisch-hall");
    const berlin = audit.find((item) => item.operatorSlug === "stromnetz-berlin");

    expect(hall).toMatchObject({
      status: "complete",
      currentValidFrom: "2026-01-01",
      issues: []
    });
    expect(berlin).toMatchObject({
      status: "missing-entry",
      issues: expect.arrayContaining([
        expect.objectContaining({
          key: "missing_entry"
        })
      ])
    });
  });

  test("summarizes counts and suggests next backfill targets", () => {
    const audit = buildEndcustomerIntegrityAudit(
      getSeedPublishedOperators(),
      getSeedEndcustomerTariffCatalog()
    );

    expect(getEndcustomerIntegrityAuditSummary(audit)).toMatchObject({
      operatorCount: expect.any(Number),
      completeCount: expect.any(Number),
      missingEntryCount: expect.any(Number),
      incompleteCount: expect.any(Number)
    });

    expect(getNextEndcustomerBackfillTargets(audit, 3)).toHaveLength(3);
    expect(getNextEndcustomerBackfillTargets(audit, 3)[0]).toMatchObject({
      operatorSlug: expect.any(String),
      status: expect.stringMatching(/missing-entry|incomplete/)
    });
  });
});
