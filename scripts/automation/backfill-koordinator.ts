import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildBackfillBriefing } from "../../src/modules/operators/backfill-briefing";
import { planBackfillCoordinatorRun, type CoordinatorClaimsBoard } from "../../src/modules/operators/backfill-koordinator";
import { loadOperatorShells } from "../../src/modules/operators/shell-catalog";
import { buildShellBackfillBatches } from "../../src/modules/operators/shell-batches";
import { getSeedOperatorStructureAudit } from "../../src/modules/operators/structure-audit";

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
  const batches = buildShellBackfillBatches(shells).batches;
  const briefing = buildBackfillBriefing({
    auditItems: getSeedOperatorStructureAudit(),
    batches
  });
  const plan = planBackfillCoordinatorRun({
    board,
    batches,
    briefing,
    mode
  });

  console.log(JSON.stringify(plan, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
