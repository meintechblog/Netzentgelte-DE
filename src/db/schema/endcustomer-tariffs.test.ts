import { getTableName } from "drizzle-orm";
import { describe, expect, test } from "vitest";

import {
  tariffComponents,
  tariffProducts,
  tariffRequirements,
  tariffTimeWindows
} from "./endcustomer-tariffs";

describe("endcustomer tariff schema", () => {
  test("defines the tariff product header for low-voltage modul products", () => {
    expect(getTableName(tariffProducts)).toBe("tariff_products");
    expect(tariffProducts.operatorId).toBeDefined();
    expect(tariffProducts.networkLevel).toBeDefined();
    expect(tariffProducts.moduleKey).toBeDefined();
    expect(tariffProducts.meteringMode).toBeDefined();
    expect(tariffProducts.sourceCatalogId).toBeDefined();
    expect(tariffProducts.sourceSnapshotId).toBeDefined();
  });

  test("defines normalized component, requirement and time-window tables", () => {
    expect(getTableName(tariffComponents)).toBe("tariff_components");
    expect(tariffComponents.tariffProductId).toBeDefined();
    expect(tariffComponents.componentKey).toBeDefined();
    expect(tariffComponents.valueNumeric).toBeDefined();
    expect(tariffComponents.unit).toBeDefined();

    expect(getTableName(tariffRequirements)).toBe("tariff_requirements");
    expect(tariffRequirements.tariffProductId).toBeDefined();
    expect(tariffRequirements.requirementKey).toBeDefined();
    expect(tariffRequirements.requirementValue).toBeDefined();

    expect(getTableName(tariffTimeWindows)).toBe("tariff_time_windows");
    expect(tariffTimeWindows.tariffProductId).toBeDefined();
    expect(tariffTimeWindows.quarterKey).toBeDefined();
    expect(tariffTimeWindows.bandKey).toBeDefined();
    expect(tariffTimeWindows.startsAt).toBeDefined();
    expect(tariffTimeWindows.endsAt).toBeDefined();
  });
});
