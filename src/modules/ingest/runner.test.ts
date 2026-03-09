import { describe, expect, test } from "vitest";

import { runIngest } from "./runner";

describe("runIngest", () => {
  test("executes an adapter and returns a normalized tariff payload", async () => {
    const result = await runIngest("demo-operator");

    expect(result.operatorSlug).toBe("demo-operator");
    expect(result.tariffs.length).toBeGreaterThan(0);
  });
});
