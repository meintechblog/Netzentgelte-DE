import { describe, expect, test } from "vitest";

import type { OperatorShell } from "./shell-catalog";
import { buildPendingOperatorCatalog, getSeedPendingOperatorCatalog } from "./pending-catalog";

function createShell(overrides: Partial<OperatorShell> = {}): OperatorShell {
  return {
    slug: "demo-netz",
    operatorName: "Demo Netz GmbH",
    countryCode: "DE",
    websiteUrl: "https://demo.example/",
    regionLabel: "Demo",
    shellStatus: "published",
    coverageStatus: "hinted",
    sourceStatus: "source-found",
    tariffStatus: "partial",
    reviewStatus: "pending",
    deprecatedStatus: "active",
    sourcePageUrl: "https://demo.example/netzentgelte",
    documentUrl: "https://demo.example/preisblatt-2026.pdf",
    notes: "Demo shell",
    lastCheckedAt: "2026-03-11",
    ...overrides
  };
}

describe("buildPendingOperatorCatalog", () => {
  test("keeps only public pending shells with meaningful status and stable summary counts", () => {
    const result = buildPendingOperatorCatalog({
      shells: [
        createShell({
          slug: "pending-netz",
          operatorName: "Pending Netz GmbH"
        }),
        createShell({
          slug: "publishable-netz",
          operatorName: "Publishable Netz GmbH",
          reviewStatus: "verified",
          tariffStatus: "verified"
        }),
        createShell({
          slug: "draft-netz",
          operatorName: "Draft Netz GmbH",
          shellStatus: "profile-found",
          sourceStatus: "candidate",
          tariffStatus: "missing",
          documentUrl: undefined,
          lastCheckedAt: null
        }),
        createShell({
          slug: "50hertz-transmission",
          operatorName: "50Hertz Transmission GmbH",
          websiteUrl: "https://www.50hertz.com/",
          sourcePageUrl: "https://www.50hertz.com/de/Transparenz"
        }),
        createShell({
          slug: "deprecated-netz",
          operatorName: "Deprecated Netz GmbH",
          deprecatedStatus: "deprecated"
        })
      ],
      publishableOperatorSlugs: new Set(["publishable-netz"])
    });

    expect(result.summary).toEqual({
      operatorCount: 1,
      sourceFoundCount: 1,
      tariffReadyCount: 1
    });
    expect(result.items).toEqual([
      {
        slug: "pending-netz",
        name: "Pending Netz GmbH",
        regionLabel: "Demo",
        sourceSlug: "pending-netz-pending",
        reviewStatus: "pending",
        sourceStatus: "source-found",
        tariffStatus: "partial",
        websiteUrl: "https://demo.example/",
        sourcePageUrl: "https://demo.example/netzentgelte",
        documentUrl: "https://demo.example/preisblatt-2026.pdf",
        notes: "Demo shell",
        checkedAt: "2026-03-11",
        publicationStatus: "pending",
        statusSummary: "Demo shell",
        missingInformation: [
          "Verifiziertes Niederspannungsprodukt fehlt",
          "Modul-3-Tarifdaten unvollständig"
        ],
        hasVerifiedLowVoltageProduct: false
      }
    ]);
  });
});

describe("getSeedPendingOperatorCatalog", () => {
  test("returns the current public pending subset without verified or transmission operators", () => {
    const result = getSeedPendingOperatorCatalog();

    expect(result.summary.operatorCount).toBeGreaterThan(20);
    expect(result.summary.sourceFoundCount).toBeLessThanOrEqual(result.summary.operatorCount);
    expect(result.summary.tariffReadyCount).toBeLessThanOrEqual(result.summary.operatorCount);
    expect(result.items.find((entry) => entry.slug === "mainnetz")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "nahwerk-energie-und")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "naturenergie-netze")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "netze-bw")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "50hertz-transmission")).toBeUndefined();
  });

  test("includes the promoted public-pending operators from backfill-ready-013", () => {
    const result = getSeedPendingOperatorCatalog();

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "alzchem-netz",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing",
          publicationStatus: "missing-data",
          checkedAt: "2026-03-12",
          missingInformation: expect.arrayContaining([
            "Verifiziertes Niederspannungsprodukt fehlt",
            "Modul-3-Tarifdaten unvollständig"
          ])
        }),
        expect.objectContaining({
          slug: "ssw-netz",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing",
          publicationStatus: "blocked"
        }),
        expect.objectContaining({
          slug: "bad-honnef",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing",
          sourcePageUrl: "https://www.bhag.de/stromnetz/",
          documentUrl: "https://www.bhag.de/wp-content/uploads/2026/02/Preisblatt-Stromnetzentgelte-ab-01.01.2026.pdf",
          publicationStatus: "missing-data",
          checkedAt: "2026-03-12",
          statusSummary: expect.stringMatching(/noch nicht vollständig veröffentlichbar|modul-3-tarifdaten unvollständig/i)
        })
      ])
    );
    expect(result.items.find((entry) => entry.slug === "stadtwerke-achim")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "ahrtal-werke")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtnetze-munster")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerk-tauberfranken")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "alliander-netz-heinsberg")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "abita-energie-otterberg")).toBeUndefined();
    expect(
      result.items.find((entry) => entry.slug === "stadtische-betriebswerke-luckenwalde")
    ).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerke-altdorf")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerke-andernach-energie")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerke-bad-aibling")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerke-bad-pyrmont")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "strom-und-gasnetz-wismar")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "evu-langenpreising")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "leinenetz")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "leitungspartner")).toBeUndefined();
    expect(
      result.items.find((entry) => entry.slug === "licht-und-kraftwerke-helmbrechts")
    ).toBeUndefined();
    expect(
      result.items.find((entry) => entry.slug === "licht-und-kraftwerke-sonneberg")
    ).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "lokalwerke")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "lsw-netz-und")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "mainnetz")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "nahwerk-energie-und")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "naturenergie-netze")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "mainsite-und")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "maintal-werke")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "markt-zellingen")).toBeUndefined();
    expect(
      result.items.find(
        (entry) => entry.slug === "mega-monheimer-elektrizitats-und-gasversorgung"
      )
    ).toBeUndefined();
    expect(
      result.items.find((entry) => entry.slug === "licht-kraft-und-wasserwerke-kitzingen")
    ).toBeUndefined();
    expect(
      result.items.find((entry) => entry.slug === "kraftwerk-farchant-a-poettinger-und")
    ).toBeUndefined();
  });
});
