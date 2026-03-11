import { describe, expect, test } from "vitest";

import { getRequestedBatchId } from "./backfill-workset";

describe("getRequestedBatchId", () => {
  test("skips the pnpm argument separator when resolving the batch id", () => {
    expect(getRequestedBatchId(["--", "backfill-ready-013"])).toBe("backfill-ready-013");
  });
});
