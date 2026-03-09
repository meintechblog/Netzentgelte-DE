import { describe, expect, test } from "vitest";

import { operators } from "./operators";
import { sourceCatalog } from "./sources";
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
});
