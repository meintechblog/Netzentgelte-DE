import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../../../../modules/operators/current-catalog";
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
    expect(data.features).toHaveLength(getSeedPublishedOperators().length);
    expect(
      data.features.find(
        (feature: { properties: { operatorSlug: string; mapDisplayMode: string }; geometry: unknown }) =>
          feature.properties.operatorSlug === "avacon-netz" &&
          feature.properties.mapDisplayMode === "hidden" &&
          feature.geometry === null
      )
    ).toBeDefined();
  });

  test("publishes exact municipality geometry for selected operators with evidence-backed coverage units", async () => {
    const response = await GET(new Request("http://localhost/api/geo/operators"));
    const data = await response.json();

    const berlin = data.features.find(
      (feature: { properties: { operatorSlug: string } }) =>
        feature.properties.operatorSlug === "stromnetz-berlin"
    );
    const schwabischHall = data.features.find(
      (feature: { properties: { operatorSlug: string } }) =>
        feature.properties.operatorSlug === "stadtwerke-schwaebisch-hall"
    );

    expect(berlin).toMatchObject({
      geometry: expect.objectContaining({
        type: expect.stringMatching(/Polygon/)
      }),
      properties: expect.objectContaining({
        geometryPrecision: "exact",
        coverageKind: "municipality-union",
        coverageUnits: expect.arrayContaining([
          expect.objectContaining({
            ags: "11000000",
            name: "Berlin"
          })
        ])
      })
    });

    expect(schwabischHall?.properties.coverageUnits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Schwäbisch Hall" }),
        expect.objectContaining({ name: "Rosengarten" }),
        expect.objectContaining({ name: "Michelbach an der Bilz" })
      ])
    );
  });
});
