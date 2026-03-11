import { describe, expect, test } from "vitest";

import { getSeedPublishedOperators } from "../../modules/operators/current-catalog";
import { getRegistryMapFeatures, projectGermanyMap } from "./geojson";

describe("projectGermanyMap", () => {
  test("keeps Bremen coverage polygons within the Germany viewport", () => {
    const scene = projectGermanyMap(getRegistryMapFeatures(getSeedPublishedOperators()));
    const bremen = scene.operators.find((feature) => feature.id === "wesernetz-bremen");

    expect(bremen?.mapDisplayMode).toBe("polygon");
    expect(bremen?.projectedGeometryPath).not.toContain("12338");
    expect(bremen?.projectedGeometryPath).not.toContain("-13031");
  });

  test("renders curated anchor seeds as visible map overlays and includes TWS Netz once seeded", () => {
    const scene = projectGermanyMap(getRegistryMapFeatures(getSeedPublishedOperators()));
    const avacon = scene.operators.find((feature) => feature.id === "avacon-netz");
    const twsNetz = scene.operators.find((feature) => feature.id === "tws-netz");

    expect(avacon?.mapDisplayMode).toBe("anchor");
    expect(avacon?.projectedOverlays.length).toBeGreaterThan(0);

    expect(twsNetz?.mapDisplayMode).toBe("anchor");
    expect(twsNetz?.projectedOverlays.length).toBeGreaterThan(0);
    expect(twsNetz?.highlightedStates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "08"
        })
      ])
    );
  });
});
