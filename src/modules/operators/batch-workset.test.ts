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

    expect(workset.items.slice(0, 3)).toEqual([
      expect.objectContaining({
        slug: "stadtwerke-altensteig",
        hostname: "stadtwerke-altensteig.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "stadtwerke-amberg-versorgungs",
        hostname: "stadtwerke-amberg.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "stadtwerke-annweiler-am-trifels",
        hostname: "stadtwerke-annweiler.de",
        sourceStatus: "candidate"
      })
    ]);
    expect(workset.items.at(-1)).toEqual(
      expect.objectContaining({
        slug: "stadtwerke-bruhl",
        hostname: "stadtwerke-bruehl.de",
        sourceStatus: "candidate"
      })
    );
  });
});
