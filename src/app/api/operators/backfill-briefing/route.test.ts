import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators/backfill-briefing", () => {
  test("returns the current structure-audit targets together with the next recommended shell batch", async () => {
    const response = await GET(new Request("http://localhost/api/operators/backfill-briefing"));
    const data = await response.json();

    expect(data.summary).toMatchObject({
      auditTargetCount: expect.any(Number),
      nextBatchOperatorCount: expect.any(Number),
      nextBatchId: expect.any(String)
    });
    expect(data.auditTargets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operatorSlug: expect.any(String),
          action: expect.any(String),
          reasonKey: expect.any(String)
        })
      ])
    );
    expect(data.nextBatch).toMatchObject({
      id: expect.any(String),
      lane: "registry-review",
      operatorCount: expect.any(Number),
      operators: expect.any(Array)
    });
  });
});
