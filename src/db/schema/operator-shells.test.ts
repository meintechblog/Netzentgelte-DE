import { getTableName } from "drizzle-orm";
import { describe, expect, test } from "vitest";

import { operatorShells } from "./operator-shells";

describe("operatorShells", () => {
  test("defines the operator shell registry table with the expected status fields", () => {
    expect(getTableName(operatorShells)).toBe("operator_shells");
    expect(operatorShells.slug).toBeDefined();
    expect(operatorShells.operatorName).toBeDefined();
    expect(operatorShells.websiteUrl).toBeDefined();
    expect(operatorShells.regionLabel).toBeDefined();
    expect(operatorShells.shellStatus).toBeDefined();
    expect(operatorShells.coverageStatus).toBeDefined();
    expect(operatorShells.sourceStatus).toBeDefined();
    expect(operatorShells.tariffStatus).toBeDefined();
    expect(operatorShells.reviewStatus).toBeDefined();
  });
});
