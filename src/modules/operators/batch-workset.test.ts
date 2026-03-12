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
        sourceCandidateCount: 20,
        sourceMissingCount: 0,
        documentedCount: 5,
        tariffMissingCount: 25,
        reviewPendingCount: 25
      }
    });

    expect(workset.items.slice(0, 3)).toEqual([
      expect.objectContaining({
        slug: "stromversorgung-schierling-eg",
        hostname: "schierling-strom.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "gemeindewerke-schwarzenbruck",
        hostname: "schwarzenbruck-gw.de",
        sourceStatus: "candidate"
      }),
      expect.objectContaining({
        slug: "sommerdaer-energieversorgung",
        hostname: "sev-soemmerda.de",
        sourceStatus: "candidate"
      })
    ]);
    expect(workset.items.at(-1)).toEqual(
      expect.objectContaining({
        slug: "stadtwerke-bebra",
        hostname: "stadtwerke-bebra-netz.de",
        sourceStatus: "candidate"
      })
    );
  });
});
