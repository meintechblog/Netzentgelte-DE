import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators/structure-audit", () => {
  test("returns internal audit items for operators not yet on the structured tariff model", async () => {
    const response = await GET(new Request("http://localhost/api/operators/structure-audit"));
    const data = await response.json();

    expect(data.summary).toMatchObject({
      itemCount: expect.any(Number),
      summaryFallbackOnlyCount: expect.any(Number),
      bandsWithoutTimeWindowsCount: expect.any(Number),
      pendingReviewCount: expect.any(Number),
      legacyShapeCount: expect.any(Number)
    });
    expect(data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operatorSlug: expect.any(String),
          operatorName: expect.any(String),
          reasonKey: expect.stringMatching(/summary_fallback_only|bands_without_time_windows/),
          severity: expect.stringMatching(/pending-review|legacy-shape/)
        })
      ])
    );
  });
});
