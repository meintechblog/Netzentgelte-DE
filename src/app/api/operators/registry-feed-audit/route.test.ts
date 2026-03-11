import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators/registry-feed-audit", () => {
  test("returns the registry feed audit summary and items", async () => {
    const response = await GET(new Request("http://localhost/api/operators/registry-feed-audit"));
    const data = await response.json();

    expect(data.summary).toMatchObject({
      latestFeedLabel: expect.any(String),
      latestFeedNewcomerCount: expect.any(Number),
      disappearanceReviewCount: expect.any(Number),
      deprecatedCount: expect.any(Number)
    });
    expect(data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operatorSlug: expect.any(String),
          status: expect.stringMatching(/latest-feed-newcomer|disappearance-review|deprecated/)
        })
      ])
    );
  });
});
