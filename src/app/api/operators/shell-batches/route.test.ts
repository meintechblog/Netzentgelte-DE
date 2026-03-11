import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/operators/shell-batches", () => {
  test("returns deterministic internal backfill batches for the shell registry", async () => {
    const response = await GET(new Request("http://localhost/api/operators/shell-batches"));
    const data = await response.json();

    expect(data.summary).toMatchObject({
      totalShellCount: expect.any(Number),
      batchCount: expect.any(Number),
      suggestedParallelAgents: expect.objectContaining({
        backfillReady: expect.any(Number),
        discovery: expect.any(Number),
        auditRefresh: expect.any(Number)
      })
    });
    expect(data.summary.totalShellCount).toBeGreaterThan(800);
    expect(data.items[0]).toMatchObject({
      id: expect.stringMatching(/backfill-ready|discovery|audit-refresh|registry-review/),
      lane: expect.any(String),
      operatorCount: expect.any(Number),
      hostnames: expect.any(Array),
      operators: expect.any(Array)
    });
  });
});
