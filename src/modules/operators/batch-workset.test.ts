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
        sourceCandidateCount: 24,
        sourceMissingCount: 0,
        documentedCount: 1,
        tariffMissingCount: 25,
        reviewPendingCount: 25
      }
    });

    expect(workset.items.slice(0, 3)).toEqual([
      expect.objectContaining({
        slug: "sommerdaer-energieversorgung",
        hostname: "sev-soemmerda.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "sew-stromversorgungs",
        hostname: "sewerding.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "stadtwerke-frondenberg-wickede",
        hostname: "sfw-ruhr.de",
        sourceStatus: "candidate"
      })
    ]);
    expect(workset.items.at(-1)).toEqual(
      expect.objectContaining({
        slug: "stadtwerke-bogen",
        hostname: "stadtwerke-bogen.de",
        sourceStatus: "candidate"
      })
    );
  });
});
