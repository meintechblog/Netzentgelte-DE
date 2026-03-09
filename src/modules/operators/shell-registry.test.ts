import { describe, expect, test } from "vitest";

import { getOperatorRegistryStats } from "./registry";
import { getOperatorShellRegistry, getOperatorShellRegistryStats, parseOperatorShellRegistry } from "./shell-registry";

describe("operatorShellRegistry", () => {
  test("parses shell entries and covers more operators than the published tariff slice", () => {
    const registry = getOperatorShellRegistry();
    const stats = getOperatorShellRegistryStats();
    const publishedStats = getOperatorRegistryStats();

    expect(registry.length).toBeGreaterThan(publishedStats.operatorCount);
    expect(stats.operatorCount).toBe(registry.length);
    expect(stats.sourceFoundCount).toBeGreaterThan(0);
    expect(stats.shellCount).toBeGreaterThan(0);
  });

  test("rejects duplicate slugs", () => {
    expect(() =>
      parseOperatorShellRegistry([
        {
          slug: "demo",
          operatorName: "Demo Netz GmbH",
          websiteUrl: "https://example.com",
          regionLabel: "Demo",
          shellStatus: "shell",
          coverageStatus: "unknown",
          sourceStatus: "missing",
          tariffStatus: "missing",
          reviewStatus: "pending"
        },
        {
          slug: "demo",
          operatorName: "Demo Netz 2 GmbH",
          websiteUrl: "https://example.org",
          regionLabel: "Demo",
          shellStatus: "shell",
          coverageStatus: "unknown",
          sourceStatus: "missing",
          tariffStatus: "missing",
          reviewStatus: "pending"
        }
      ])
    ).toThrow(/Duplicate shell slug demo/);
  });
});
