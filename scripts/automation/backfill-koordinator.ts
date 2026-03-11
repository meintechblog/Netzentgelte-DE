import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { planBackfillCoordinatorRun, type CoordinatorClaimsBoard } from "../../src/modules/operators/backfill-koordinator";
import { getOperatorRegistry } from "../../src/modules/operators/registry";
import { loadOperatorShells } from "../../src/modules/operators/shell-catalog";
import { buildShellBackfillBatches } from "../../src/modules/operators/shell-batches";
import { selectVerifiedCandidate } from "../../src/modules/operators/verified-candidate-selector";

function readClaimsBoard(projectRoot: string): CoordinatorClaimsBoard {
  const claimsBoardPath = join(projectRoot, "docs/coordination/claims-board.json");

  if (!existsSync(claimsBoardPath)) {
    return {
      meta: {
        updatedAt: new Date().toISOString(),
        lastPollAt: new Date().toISOString(),
        dispatchStatus: "ready",
        maxActiveClaims: 4,
        activeClaimCount: 0,
        blocker: null,
        notes: []
      },
      activeClaims: [],
      completedClaims: [],
      releasedClaims: []
    };
  }

  return JSON.parse(readFileSync(claimsBoardPath, "utf8")) as CoordinatorClaimsBoard;
}

async function main() {
  const mode = process.argv.includes("--live") ? "live" : "dry-run";
  const projectRoot = process.cwd();
  const board = readClaimsBoard(projectRoot);
  const shells = await loadOperatorShells();
  const registryEntries = getOperatorRegistry();
  const batches = buildShellBackfillBatches(shells).batches;
  const candidateSelection = selectVerifiedCandidate(shells, registryEntries);
  const plan = planBackfillCoordinatorRun({
    board,
    batches,
    candidateSelection,
    mode
  });

  console.log(JSON.stringify(plan, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
