import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators", () => {
  test("returns registry-backed operators", async () => {
    const response = await GET(new Request("http://localhost/api/operators"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      slug: expect.any(String),
      name: expect.any(String),
      sourceDocumentCount: expect.any(Number)
    });
  });
});
