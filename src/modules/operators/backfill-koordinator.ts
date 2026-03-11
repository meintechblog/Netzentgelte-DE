import { buildAutomationCommandPlan, type AutomationCommandPlan } from "./automation-commands";
import { getCompletedClaimsAwaitingIntegration, type ClaimsBoard } from "./claims-board";
import type { VerifiedCandidateSelection, VerifiedCandidateStage } from "./verified-candidate-selector";
import type { ShellBackfillBatch } from "./shell-batches";

export type CoordinatorClaimsBoard = ClaimsBoard;

export type CoordinatorRunPlan = {
  mode: "dry-run" | "live";
  intent: "integrate" | "verify" | "blocked" | "idle";
  integrateBatchIds: string[];
  dispatchBatchId: string | null;
  dispatchLane: ShellBackfillBatch["lane"] | null;
  verifyOperatorSlug: string | null;
  verifyStage: VerifiedCandidateStage | null;
  notes: string[];
  commands: AutomationCommandPlan;
};

export function planBackfillCoordinatorRun(input: {
  board: CoordinatorClaimsBoard;
  batches: ShellBackfillBatch[];
  candidateSelection: VerifiedCandidateSelection;
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
      verifyOperatorSlug: null,
      verifyStage: null,
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
      verifyOperatorSlug: null,
      verifyStage: null,
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
      verifyOperatorSlug: null,
      verifyStage: null,
      notes: ["No free worker capacity for a new dispatch."],
      commands
    };
  }

  if (input.candidateSelection.selected) {
    return {
      mode: input.mode,
      intent: "verify",
      integrateBatchIds: [],
      dispatchBatchId: null,
      dispatchLane: null,
      verifyOperatorSlug: input.candidateSelection.selected.slug,
      verifyStage: input.candidateSelection.selected.stage,
      notes: [
        `Verify next operator ${input.candidateSelection.selected.slug}.`,
        "Verified-first ordering treats homepage growth as the primary success metric."
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
    verifyOperatorSlug: null,
    verifyStage: null,
    notes:
      input.candidateSelection.blocked.length > 0
        ? ["No verification-ready operator qualifies right now.", "Review blocked evidence candidates next."]
        : ["No verification-ready operator requires action right now."],
    commands
  };
}
