import { describe, expect, test } from "vitest";

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
});
