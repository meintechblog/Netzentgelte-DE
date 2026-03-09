import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/sources/current", () => {
  test("returns reviewable current source entries with artifact metadata", async () => {
    const response = await GET(new Request("http://localhost/api/sources/current"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      sourceSlug: expect.any(String),
      operatorSlug: expect.any(String),
      pageUrl: expect.any(String),
      documentUrl: expect.any(String),
      checkedAt: expect.any(String)
    });
    expect(data.items[0]).toHaveProperty("artifactApiUrl");
  });
});
