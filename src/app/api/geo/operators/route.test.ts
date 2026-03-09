import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/geo/operators", () => {
  test("returns registry-backed geo feature metadata", async () => {
    const response = await GET(new Request("http://localhost/api/geo/operators"));
    const data = await response.json();

    expect(data.features[0]).toMatchObject({
      id: expect.any(String),
      properties: expect.objectContaining({
        operatorSlug: expect.any(String),
        sourcePageUrl: expect.any(String)
      })
    });
  });
});
