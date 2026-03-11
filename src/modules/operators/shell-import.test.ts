import { describe, expect, test } from "vitest";

import { buildShellImportPayload, summarizeShellImport } from "./shell-import";
import { getOperatorShellRegistry, getOperatorShellRegistryStats } from "./shell-registry";

describe("buildShellImportPayload", () => {
  test("maps shell registry entries into database-ready rows", () => {
    const payload = buildShellImportPayload(getOperatorShellRegistry());

    expect(payload.shells[0]).toMatchObject({
      slug: expect.any(String),
      operatorName: expect.any(String),
      countryCode: "DE",
      shellStatus: expect.any(String),
      coverageStatus: expect.any(String),
      sourceStatus: expect.any(String),
      tariffStatus: expect.any(String),
      reviewStatus: expect.any(String)
    });
  });
});

describe("summarizeShellImport", () => {
  test("returns status counts for the imported shell slice", () => {
    const payload = buildShellImportPayload(getOperatorShellRegistry());
    const summary = summarizeShellImport(payload);
    const registryStats = getOperatorShellRegistryStats();

    expect(summary.operatorCount).toBe(registryStats.operatorCount);
    expect(summary.verifiedCount).toBe(registryStats.verifiedCount);
    expect(summary.exactCoverageCount).toBe(registryStats.exactCoverageCount);
  });
});
