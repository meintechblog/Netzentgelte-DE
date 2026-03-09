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
});
