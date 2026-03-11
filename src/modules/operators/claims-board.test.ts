import { describe, expect, test } from "vitest";

import {
  clearClaimsBoardBlocker,
  createClaimsBoardMarkdown,
  getCompletedClaimsAwaitingIntegration,
  markClaimsBoardBlocked,
  type ClaimsBoard
} from "./claims-board";

const board: ClaimsBoard = {
  meta: {
    updatedAt: "2026-03-11T10:00:00.000Z",
    lastPollAt: "2026-03-11T10:00:00.000Z",
    dispatchStatus: "ready",
    maxActiveClaims: 4,
    activeClaimCount: 1,
    blocker: null,
    notes: ["initial note"]
  },
  activeClaims: [
    {
      batchId: "backfill-ready-020",
      lane: "backfill-ready",
      assignee: "Curie",
      status: "in-progress",
      workerAgentId: "agent-1",
      claimedAt: "2026-03-11T10:00:00.000Z",
      worktree: "/tmp/backfill-ready-020",
      branch: "codex/backfill-ready-020",
      dispatchBrief: "/tmp/backfill-ready-020.md",
      operatorCount: 12,
      hostnames: ["alpha.example"],
      summary: "batch 20"
    }
  ],
  completedClaims: [
    {
      batchId: "backfill-ready-019",
      lane: "backfill-ready",
      assignee: "Sartre",
      status: "completed-awaiting-integration",
      workerAgentId: "agent-2",
      claimedAt: "2026-03-11T09:00:00.000Z",
      completedAt: "2026-03-11T09:30:00.000Z",
      worktree: "/tmp/backfill-ready-019",
      branch: "codex/backfill-ready-019",
      dispatchBrief: "/tmp/backfill-ready-019.md",
      operatorCount: 7,
      hostnames: ["beta.example"],
      summary: "batch 19"
    }
  ],
  releasedClaims: []
};

describe("claims-board helpers", () => {
  test("lists completed claims awaiting integration before new dispatch work", () => {
    expect(getCompletedClaimsAwaitingIntegration(board)).toEqual([
      expect.objectContaining({
        batchId: "backfill-ready-019",
        status: "completed-awaiting-integration"
      })
    ]);
  });

  test("records and clears a gate blocker without losing claim state", () => {
    const blockedBoard = markClaimsBoardBlocked(board, {
      now: "2026-03-11T10:15:00.000Z",
      message: "pnpm typecheck failed",
      command: "pnpm typecheck"
    });

    expect(blockedBoard.meta.dispatchStatus).toBe("blocked");
    expect(blockedBoard.meta.blocker).toEqual({
      kind: "gate-failed",
      message: "pnpm typecheck failed",
      command: "pnpm typecheck",
      recordedAt: "2026-03-11T10:15:00.000Z"
    });
    expect(blockedBoard.completedClaims).toHaveLength(1);

    const clearedBoard = clearClaimsBoardBlocker(blockedBoard, "2026-03-11T10:20:00.000Z");

    expect(clearedBoard.meta.dispatchStatus).toBe("ready");
    expect(clearedBoard.meta.blocker).toBeNull();
    expect(clearedBoard.meta.updatedAt).toBe("2026-03-11T10:20:00.000Z");
  });

  test("renders a readable markdown summary for operators and blockers", () => {
    const markdown = createClaimsBoardMarkdown(
      markClaimsBoardBlocked(board, {
        now: "2026-03-11T10:15:00.000Z",
        message: "pnpm typecheck failed",
        command: "pnpm typecheck"
      })
    );

    expect(markdown).toContain("# Netzbetreiber Backfill Claims Board");
    expect(markdown).toContain("backfill-ready-020");
    expect(markdown).toContain("backfill-ready-019");
    expect(markdown).toContain("pnpm typecheck failed");
  });
});
