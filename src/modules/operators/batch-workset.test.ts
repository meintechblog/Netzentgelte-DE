import { describe, expect, test } from "vitest";

import { buildBackfillBatchWorkset } from "./batch-workset";
import { getSeedOperatorShells } from "./shell-catalog";
import { buildShellBackfillBatches } from "./shell-batches";

describe("buildBackfillBatchWorkset", () => {
  test("builds a deterministic workset for backfill-ready-013", () => {
    const shells = getSeedOperatorShells();
    const batch = buildShellBackfillBatches(shells).batches.find((entry) => entry.id === "backfill-ready-013");

    expect(batch).toBeDefined();

    const workset = buildBackfillBatchWorkset(batch!);
    const rerun = buildBackfillBatchWorkset(batch!);

    expect(workset).toMatchObject({
      batchId: "backfill-ready-013",
      lane: "backfill-ready",
      operatorCount: 25,
      hostnameCount: 25,
      summary: {
        sourceCandidateCount: 25,
        sourceMissingCount: 0,
        documentedCount: 0,
        tariffMissingCount: 25,
        reviewPendingCount: 25
      }
    });
    expect(rerun).toEqual(workset);
    expect(workset.items.every((item) => item.sourceStatus === "candidate")).toBe(true);
    expect(workset.items.every((item) => item.tariffStatus === "missing")).toBe(true);
    expect(workset.items.every((item) => item.reviewStatus === "pending")).toBe(true);
    expect(workset.items.every((item) => item.backfillStage === "source-validation")).toBe(true);
    expect(workset.items[0]).toMatchObject({
      slug: expect.any(String),
      hostname: expect.any(String),
      sourceStatus: "candidate"
    });
    expect(workset.items.at(-1)).toMatchObject({
      slug: expect.any(String),
      hostname: expect.any(String),
      sourceStatus: "candidate"
    });
  });
});
