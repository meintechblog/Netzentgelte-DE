import { describe, expect, test } from "vitest";

import { getOperatorRegistryStats } from "./registry";
import { getOperatorShellRegistry, getOperatorShellRegistryStats, parseOperatorShellRegistry } from "./shell-registry";

describe("operatorShellRegistry", () => {
  test("parses shell entries and covers more operators than the published tariff slice", () => {
    const registry = getOperatorShellRegistry();
    const stats = getOperatorShellRegistryStats();
    const publishedStats = getOperatorRegistryStats();

    expect(registry.length).toBeGreaterThan(800);
    expect(registry.length).toBeGreaterThan(publishedStats.operatorCount);
    expect(stats.operatorCount).toBe(registry.length);
    expect(stats.sourceFoundCount).toBeGreaterThan(0);
    expect(stats.shellCount).toBeGreaterThan(0);
  });

  test("contains every currently published operator slug in the shell registry", () => {
    const shellSlugs = new Set(getOperatorShellRegistry().map((entry) => entry.slug));

    for (const slug of [
      "netze-bw",
      "bayernwerk-netz",
      "stromnetz-berlin",
      "stadtwerke-schwaebisch-hall",
      "mittelhessen-netz",
      "thueringer-energienetze"
    ]) {
      expect(shellSlugs.has(slug)).toBe(true);
    }
  });

  test("includes distinct operator shells that only appear in the rollout quota supplement", () => {
    const shells = getOperatorShellRegistry();
    const shellSlugs = new Set(shells.map((entry) => entry.slug));

    for (const slug of [
      "50hertz-transmission",
      "amprion",
      "hamburger-energienetze",
      "transnetbw"
    ]) {
      expect(shellSlugs.has(slug)).toBe(true);
    }

    expect(shells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "50hertz-transmission",
          registryFeedSource: "bnetza-rollout-quote",
          registryFeedLabel: "2025-Q3",
          lastSeenInRegistryFeed: "2025-09-30",
          deprecatedStatus: "active"
        })
      ])
    );
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
