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
        slug: "stadtwerke-bad-nauheim",
        hostname: "stadtwerke-bad-nauheim.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "stadtwerke-bad-reichenhall-ku",
        hostname: "stadtwerke-bad-reichenhall.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "stadtwerke-bad-wildbad-und",
        hostname: "stadtwerke-bad-wildbad.de",
        sourceStatus: "candidate"
      })
    ]);
    expect(workset.items.at(-1)).toEqual(
      expect.objectContaining({
        slug: "stadtwerke-buchen-und",
        hostname: "stadtwerke-buchen.de",
        sourceStatus: "candidate"
      })
    );
  });
});
