import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/current", () => {
  test("returns current tariff payload with source metadata and modul-3 bands", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/current"));
    const data = await response.json();

    expect(data.items[0]).toMatchObject({
      operatorSlug: expect.any(String),
      sourcePageUrl: expect.any(String),
      documentUrl: expect.any(String),
      bands: expect.arrayContaining([
        expect.objectContaining({
          key: expect.any(String)
        })
      ])
    });
  });
});
