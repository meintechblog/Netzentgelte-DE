import { describe, expect, test } from "vitest";

import {
  tariffComponents,
  tariffProducts,
  tariffRequirements,
  tariffTimeWindows
} from "./endcustomer-tariffs";
import { operators } from "./operators";
import { sourceCatalog, sourceSnapshots } from "./sources";
import { tariffVersions } from "./tariffs";
import { tables } from "./index";

describe("database schema bootstrap", () => {
  test("registers the required core tables", () => {
    expect(tables).toEqual(
      expect.arrayContaining([
        "operators",
        "source_catalog",
        "source_snapshots",
        "tariff_versions",
        "tariff_products",
        "tariff_components",
        "tariff_requirements",
        "tariff_time_windows",
        "operator_geometries",
        "ingest_runs"
      ])
    );
  });

  test("persists operator registry metadata fields", () => {
    expect(operators.regionLabel).toBeDefined();
    expect(operators.websiteUrl).toBeDefined();
  });

  test("stores an explicit modul-3 band key per tariff row", () => {
    expect(tariffVersions.bandKey).toBeDefined();
  });

  test("stores a first-class source page url for refresh and audit flows", () => {
    expect(sourceCatalog.pageUrl).toBeDefined();
  });

  test("stores the artifact role for each source snapshot", () => {
    expect(sourceSnapshots.artifactKind).toBeDefined();
  });

  test("registers the endcustomer product model tables", () => {
    expect(tariffProducts.moduleKey).toBeDefined();
    expect(tariffComponents.componentKey).toBeDefined();
    expect(tariffRequirements.requirementKey).toBeDefined();
    expect(tariffTimeWindows.quarterKey).toBeDefined();
  });
});
