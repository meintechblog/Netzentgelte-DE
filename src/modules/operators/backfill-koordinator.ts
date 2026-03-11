import type { BackfillBriefing } from "./backfill-briefing";
import { buildAutomationCommandPlan, type AutomationCommandPlan } from "./automation-commands";
import { getCompletedClaimsAwaitingIntegration, type ClaimsBoard } from "./claims-board";
import type { ShellBackfillBatch } from "./shell-batches";

export type CoordinatorClaimsBoard = ClaimsBoard;

export type CoordinatorRunPlan = {
  mode: "dry-run" | "live";
  intent: "integrate" | "dispatch" | "blocked" | "idle";
  integrateBatchIds: string[];
  dispatchBatchId: string | null;
  dispatchLane: ShellBackfillBatch["lane"] | null;
  notes: string[];
  commands: AutomationCommandPlan;
};

export function planBackfillCoordinatorRun(input: {
  board: CoordinatorClaimsBoard;
  batches: ShellBackfillBatch[];
  briefing: BackfillBriefing;
  mode: "dry-run" | "live";
}): CoordinatorRunPlan {
  const commands = buildAutomationCommandPlan();
  const completedClaims = getCompletedClaimsAwaitingIntegration(input.board);

  if (input.board.meta.blocker) {
    return {
      mode: input.mode,
      intent: "blocked",
      integrateBatchIds: [],
      dispatchBatchId: null,
      dispatchLane: null,
      notes: [
        `Active blocker: ${input.board.meta.blocker.message}`,
        "Revalidate the gate before dispatching more work."
      ],
      commands
    };
  }

  if (completedClaims.length > 0) {
    return {
      mode: input.mode,
      intent: "integrate",
      integrateBatchIds: completedClaims.map((claim) => claim.batchId),
      dispatchBatchId: null,
      dispatchLane: null,
      notes: [
        `Found ${completedClaims.length} completed claim(s) awaiting integration.`,
        "Integration comes before any new dispatch."
      ],
      commands
    };
  }

  const activeClaimCount = input.board.activeClaims.filter((claim) => claim.status === "in-progress").length;
  if (activeClaimCount >= input.board.meta.maxActiveClaims) {
    return {
      mode: input.mode,
      intent: "idle",
      integrateBatchIds: [],
      dispatchBatchId: null,
      dispatchLane: null,
      notes: ["No free worker capacity for a new dispatch."],
      commands
    };
  }

  const claimedBatchIds = new Set([
    ...input.board.activeClaims.map((claim) => claim.batchId),
    ...input.board.completedClaims.map((claim) => claim.batchId),
    ...input.board.releasedClaims.map((claim) => claim.batchId)
  ]);
  const preferredBatch = input.briefing.nextBatch;
  const nextBatch =
    (preferredBatch && !claimedBatchIds.has(preferredBatch.id) ? preferredBatch : null) ??
    input.batches.find((batch) => !claimedBatchIds.has(batch.id)) ??
    null;

  if (nextBatch) {
    return {
      mode: input.mode,
      intent: "dispatch",
      integrateBatchIds: [],
      dispatchBatchId: nextBatch.id,
      dispatchLane: nextBatch.lane,
      notes: [
        `Dispatch next batch ${nextBatch.id}.`,
        "Promotion-first ordering keeps backfill-ready work ahead of registry review."
      ],
      commands
    };
  }

  return {
    mode: input.mode,
    intent: "idle",
    integrateBatchIds: [],
    dispatchBatchId: null,
    dispatchLane: null,
    notes: ["No pending batch requires action right now."],
    commands
  };
}
