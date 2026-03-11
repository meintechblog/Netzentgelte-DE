import { describe, expect, test } from "vitest";

import { planBackfillCoordinatorRun, type CoordinatorClaimsBoard } from "./backfill-koordinator";
import type { VerifiedCandidateSelection } from "./verified-candidate-selector";
import type { ShellBackfillBatch } from "./shell-batches";

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

const noCandidate: VerifiedCandidateSelection = {
  selected: null,
  blocked: [],
  candidates: [],
  summary: {
    queuedCount: 0,
    evidenceReadyCount: 0,
    verificationReadyCount: 0,
    blockedCount: 0
  }
};

describe("planBackfillCoordinatorRun", () => {
  test("prioritizes completed claims awaiting integration ahead of new dispatches", () => {
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
      candidateSelection: noCandidate,
      mode: "dry-run"
    });

    expect(plan.intent).toBe("integrate");
    expect(plan.integrateBatchIds).toEqual(["backfill-ready-020"]);
    expect(plan.dispatchBatchId).toBeNull();
    expect(plan.notes[0]).toContain("completed");
  });

  test("selects the next verification-ready operator instead of dispatching a batch", () => {
    const plan = planBackfillCoordinatorRun({
      board: emptyBoard,
      batches,
      candidateSelection: {
        selected: {
          slug: "stadtwerke-andernach-energie",
          operatorName: "Stadtwerke Andernach Energie GmbH",
          stage: "verification-ready",
          score: 120,
          blockedReasons: []
        },
        blocked: [],
        candidates: [],
        summary: {
          queuedCount: 0,
          evidenceReadyCount: 1,
          verificationReadyCount: 1,
          blockedCount: 0
        }
      },
      mode: "dry-run"
    });

    expect(plan.intent).toBe("verify");
    expect(plan.verifyOperatorSlug).toBe("stadtwerke-andernach-energie");
    expect(plan.verifyStage).toBe("verification-ready");
    expect(plan.integrateBatchIds).toEqual([]);
  });

  test("stops dispatch when a blocker is still active", () => {
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
      candidateSelection: noCandidate,
      mode: "dry-run"
    });

    expect(plan.intent).toBe("blocked");
    expect(plan.verifyOperatorSlug).toBeNull();
    expect(plan.integrateBatchIds).toEqual([]);
    expect(plan.notes[0]).toContain("pnpm test failed");
  });
});
