export type ClaimsBoardLane = "backfill-ready" | "registry-review" | "discovery" | "audit-refresh";

export type ClaimsBoardBlocker = {
  kind: "gate-failed";
  message: string;
  command: string;
  recordedAt: string;
};

export type ClaimsBoardMeta = {
  updatedAt: string;
  lastPollAt: string;
  dispatchStatus: "ready" | "blocked";
  maxActiveClaims: number;
  activeClaimCount: number;
  blocker: ClaimsBoardBlocker | null;
  notes: string[];
};

export type ClaimsBoardClaim = {
  batchId: string;
  lane: ClaimsBoardLane;
  assignee: string;
  status: "in-progress" | "completed-awaiting-integration";
  workerAgentId: string;
  claimedAt: string;
  completedAt?: string;
  worktree: string;
  branch: string;
  dispatchBrief: string;
  operatorCount: number;
  hostnames: string[];
  summary: string;
};

export type ClaimsBoardReleasedClaim = {
  batchId: string;
  assignee: string;
  status: "integrated-on-main";
  sourceCommit: string;
  mainCommit: string;
  summary: string;
};

export type ClaimsBoard = {
  meta: ClaimsBoardMeta;
  activeClaims: ClaimsBoardClaim[];
  completedClaims: ClaimsBoardClaim[];
  releasedClaims: ClaimsBoardReleasedClaim[];
};

export function getCompletedClaimsAwaitingIntegration(board: ClaimsBoard) {
  return board.completedClaims
    .filter((claim) => claim.status === "completed-awaiting-integration")
    .sort((left, right) => left.batchId.localeCompare(right.batchId, "de"));
}

export function markClaimsBoardBlocked(
  board: ClaimsBoard,
  input: {
    now: string;
    message: string;
    command: string;
  }
): ClaimsBoard {
  return {
    ...board,
    meta: {
      ...board.meta,
      updatedAt: input.now,
      lastPollAt: input.now,
      dispatchStatus: "blocked",
      blocker: {
        kind: "gate-failed",
        message: input.message,
        command: input.command,
        recordedAt: input.now
      }
    }
  };
}

export function clearClaimsBoardBlocker(board: ClaimsBoard, now: string): ClaimsBoard {
  return {
    ...board,
    meta: {
      ...board.meta,
      updatedAt: now,
      lastPollAt: now,
      dispatchStatus: "ready",
      blocker: null
    }
  };
}

export function createClaimsBoardMarkdown(board: ClaimsBoard) {
  const blockerLabel = board.meta.blocker
    ? `${board.meta.blocker.message} (${board.meta.blocker.command})`
    : "none";
  const activeRows = board.activeClaims.length
    ? board.activeClaims
        .map(
          (claim) =>
            `| ${claim.batchId} | ${claim.assignee} | ${claim.workerAgentId.slice(0, 8)} | ${claim.lane} | ${claim.operatorCount} | ${claim.status} |`
        )
        .join("\n")
    : "| none | - | - | - | 0 | idle |";
  const completedRows = board.completedClaims.length
    ? board.completedClaims
        .map(
          (claim) => `| ${claim.batchId} | ${claim.assignee} | ${claim.lane} | ${claim.operatorCount} | ${claim.status} |`
        )
        .join("\n")
    : "| none | - | - | 0 | none |";

  return `# Netzbetreiber Backfill Claims Board

- Last Poll (UTC): ${board.meta.lastPollAt}
- Dispatch Status: ${board.meta.dispatchStatus}
- Capacity: ${board.meta.activeClaimCount}/${board.meta.maxActiveClaims} active, ${board.completedClaims.length} completed-awaiting-integration
- Blocker: ${blockerLabel}

## Active Claims

| Batch | Assignee | Agent | Lane | Operators | Status |
| --- | --- | --- | --- | ---: | --- |
${activeRows}

## Completed Claims

| Batch | Assignee | Lane | Operators | Status |
| --- | --- | --- | ---: | --- |
${completedRows}

## Poll Notes
${board.meta.notes.map((note) => `- ${note}`).join("\n")}
`;
}
