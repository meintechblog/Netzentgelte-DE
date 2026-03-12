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
        reviewStatus: "pending",
        sourceStatus: "source-found",
        tariffStatus: "partial",
        websiteUrl: "https://demo.example/",
        checkedAt: "2026-03-11"
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
    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "mainnetz",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "partial"
        })
      ])
    );
    expect(result.items.find((entry) => entry.slug === "netze-bw")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "50hertz-transmission")).toBeUndefined();
  });

  test("includes the promoted public-pending operators from backfill-ready-013", () => {
    const result = getSeedPendingOperatorCatalog();

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "stadtnetze-munster",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing"
        }),
        expect.objectContaining({
          slug: "stadtische-betriebswerke-luckenwalde",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing"
        }),
        expect.objectContaining({
          slug: "stadtwerke-bad-pyrmont",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing"
        }),
        expect.objectContaining({
          slug: "stadtwerk-tauberfranken",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing"
        }),
        expect.objectContaining({
          slug: "ssw-netz",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing"
        }),
        expect.objectContaining({
          slug: "strom-und-gasnetz-wismar",
          reviewStatus: "pending",
          sourceStatus: "source-found",
          tariffStatus: "missing"
        })
      ])
    );
    expect(result.items.find((entry) => entry.slug === "stadtwerke-achim")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "ahrtal-werke")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "abita-energie-otterberg")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerke-altdorf")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerke-andernach-energie")).toBeUndefined();
    expect(result.items.find((entry) => entry.slug === "stadtwerke-bad-aibling")).toBeUndefined();
  });
});
