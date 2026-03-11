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
