import { describe, expect, test } from "vitest";

import {
  getSeedOperatorShells,
  getShellCatalogStats,
  shouldUseSeedOperatorShells
} from "./shell-catalog";
import { getOperatorShellRegistryStats } from "./shell-registry";

describe("getSeedOperatorShells", () => {
  test("keeps the shell registry available for internal discovery views", () => {
    const shells = getSeedOperatorShells();
    const stats = getShellCatalogStats(shells);
    const registryStats = getOperatorShellRegistryStats();

    expect(shells[0]).toMatchObject({
      slug: expect.any(String),
      operatorName: expect.any(String),
      shellStatus: expect.any(String),
      sourceStatus: expect.any(String),
      tariffStatus: expect.any(String)
    });
    expect(shells.length).toBe(registryStats.operatorCount);
    expect(stats.verifiedCount).toBe(registryStats.verifiedCount);
    expect(stats.exactCoverageCount).toBe(registryStats.exactCoverageCount);
  });

  test("includes source-found shell metadata for the first verified backfill-ready-013 operators", () => {
    const shells = getSeedOperatorShells();

    expect(shells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "stadtwerke-achim",
          shellStatus: "published",
          sourceStatus: "source-found",
          sourcePageUrl:
            "https://www.stadtwerke-achim.de/de/Netz-Hausanschluesse/Privatkunden/Service/Veroeffentlichungspflichten-Strom/Stromnetz-2020/Netzzugang-Entgelte1.html",
          documentUrl:
            "https://www.stadtwerke-achim.de/de/Netz-Hausanschluesse/Privatkunden/Service/Veroeffentlichungspflichten-Strom/Stromnetz-2020/Netzzugang-Entgelte1/PB-KK-NNE-Strom-2026-01-01.pdf"
        }),
        expect.objectContaining({
          slug: "stadtwerke-bad-aibling",
          shellStatus: "published",
          sourceStatus: "source-found",
          sourcePageUrl: "https://www.stadtwerke-bad-aibling.de/de/Strom/Stromnetz1/Netzzugang-Entgelte/",
          documentUrl: "https://www.stadtwerke-bad-aibling.de/de/Strom/Preisblatt-Netznutzung-ab01012026-endgueltig.pdf"
        }),
        expect.objectContaining({
          slug: "ssw-netz",
          shellStatus: "published",
          sourceStatus: "source-found",
          sourcePageUrl: "https://ssw-netz.de/stromnetz/netzzugang-und-entgelte-strom/netznutzungsentgelte-strom/",
          documentUrl:
            "https://ssw-netz.de/wp-content/uploads/sites/4/2025/12/P1-021_Preisblaetter_Netznutzung_Strom_SSW_Netz_20260101_endgueltig.pdf"
        })
      ])
    );
  });
});

describe("shouldUseSeedOperatorShells", () => {
  test("falls back to seed data in tests or without a database url", () => {
    expect(
      shouldUseSeedOperatorShells({
        nodeEnv: "test",
        databaseUrl: "postgres://demo"
      })
    ).toBe(true);
    expect(
      shouldUseSeedOperatorShells({
        nodeEnv: "development",
        databaseUrl: undefined
      })
    ).toBe(true);
    expect(
      shouldUseSeedOperatorShells({
        nodeEnv: "development",
        databaseUrl: "postgres://demo"
      })
    ).toBe(false);
  });
});
