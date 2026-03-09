import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/geo/operators", () => {
  test("returns registry-backed geographic metadata in WGS84-friendly shape", async () => {
    const response = await GET(new Request("http://localhost/api/geo/operators"));
    const data = await response.json();

    expect(data.features[0]).toMatchObject({
      id: expect.any(String),
      properties: expect.objectContaining({
        operatorSlug: expect.any(String),
        sourcePageUrl: expect.any(String),
        geometryPrecision: expect.any(String),
        coverageKind: expect.any(String),
        anchor: expect.objectContaining({
          longitude: expect.any(Number),
          latitude: expect.any(Number)
        })
      }),
      geometry: null
    });
    expect(data.features[0].properties.svgPath).toBeUndefined();
    expect(data.features).toHaveLength(20);
    expect(
      data.features.find(
        (feature: { properties: { operatorSlug: string } }) =>
          feature.properties.operatorSlug === "avacon-netz"
      )
    ).toBeUndefined();
  });
});
