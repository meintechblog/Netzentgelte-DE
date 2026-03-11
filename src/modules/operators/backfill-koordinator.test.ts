import { describe, expect, test } from "vitest";

import { buildBackfillBriefing } from "./backfill-briefing";
import { planBackfillCoordinatorRun, type CoordinatorClaimsBoard } from "./backfill-koordinator";
import type { ShellBackfillBatch } from "./shell-batches";
import type { StructureAuditItem } from "./structure-audit";

const auditItems: StructureAuditItem[] = [];

const batches: ShellBackfillBatch[] = [
  {
    id: "backfill-ready-021",
    lane: "backfill-ready",
    operatorCount: 3,
    hostnames: ["alpha.example"],
    operators: []
  },
  {
    id: "registry-review-004",
    lane: "registry-review",
    operatorCount: 2,
    hostnames: ["rollout.example"],
    operators: []
  }
];

const emptyBoard: CoordinatorClaimsBoard = {
  meta: {
    updatedAt: "2026-03-11T10:00:00.000Z",
    lastPollAt: "2026-03-11T10:00:00.000Z",
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

describe("planBackfillCoordinatorRun", () => {
  test("prioritizes completed claims awaiting integration ahead of new dispatches", () => {
    const briefing = buildBackfillBriefing({ auditItems, batches });
    const plan = planBackfillCoordinatorRun({
      board: {
        ...emptyBoard,
        completedClaims: [
          {
            batchId: "backfill-ready-020",
            lane: "backfill-ready",
            assignee: "Curie",
            status: "completed-awaiting-integration",
            workerAgentId: "agent-1",
            claimedAt: "2026-03-11T09:00:00.000Z",
            completedAt: "2026-03-11T09:30:00.000Z",
            worktree: "/tmp/backfill-ready-020",
            branch: "codex/backfill-ready-020",
            dispatchBrief: "/tmp/backfill-ready-020.md",
            operatorCount: 12,
            hostnames: ["alpha.example"],
            summary: "batch 20"
          }
        ]
      },
      batches,
      briefing,
      mode: "dry-run"
    });

    expect(plan.intent).toBe("integrate");
    expect(plan.integrateBatchIds).toEqual(["backfill-ready-020"]);
    expect(plan.dispatchBatchId).toBeNull();
    expect(plan.notes[0]).toContain("completed");
  });

  test("dispatches the next promotable backfill batch when capacity is available", () => {
    const briefing = buildBackfillBriefing({ auditItems, batches });
    const plan = planBackfillCoordinatorRun({
      board: emptyBoard,
      batches,
      briefing,
      mode: "dry-run"
    });

    expect(plan.intent).toBe("dispatch");
    expect(plan.dispatchBatchId).toBe("backfill-ready-021");
    expect(plan.dispatchLane).toBe("backfill-ready");
    expect(plan.integrateBatchIds).toEqual([]);
  });

  test("stops dispatch when a blocker is still active", () => {
    const briefing = buildBackfillBriefing({ auditItems, batches });
    const plan = planBackfillCoordinatorRun({
      board: {
        ...emptyBoard,
        meta: {
          ...emptyBoard.meta,
          dispatchStatus: "blocked",
          blocker: {
            kind: "gate-failed",
            message: "pnpm test failed",
            command: "pnpm test",
            recordedAt: "2026-03-11T09:59:00.000Z"
          }
        }
      },
      batches,
      briefing,
      mode: "dry-run"
    });

    expect(plan.intent).toBe("blocked");
    expect(plan.dispatchBatchId).toBeNull();
    expect(plan.integrateBatchIds).toEqual([]);
    expect(plan.notes[0]).toContain("pnpm test failed");
  });
});
