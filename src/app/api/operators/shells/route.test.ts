import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators/shells", () => {
  test("returns the internal shell registry view with summary counts", async () => {
    const response = await GET(new Request("http://localhost/api/operators/shells"));
    const data = await response.json();

    expect(data.summary).toMatchObject({
      operatorCount: expect.any(Number),
      verifiedCount: expect.any(Number),
      exactCoverageCount: expect.any(Number)
    });
    expect(data.summary.operatorCount).toBeGreaterThan(24);
    expect(data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "stromnetz-berlin",
          reviewStatus: "verified",
          coverageStatus: "exact"
        }),
        expect.objectContaining({
          slug: "rhein-netz",
          shellStatus: "shell",
          reviewStatus: "pending"
        })
      ])
    );
  });
});
