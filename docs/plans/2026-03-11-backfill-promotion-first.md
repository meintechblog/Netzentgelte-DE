# Backfill Promotion First Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prioritize `backfill-ready` operator batches before `registry-review` so promotable pending operators are worked first.

**Architecture:** Keep the lane classification unchanged and only adjust priority order where batches are assembled and where the next recommended batch is selected. Prove the behavior first with small failing tests, then make the minimum code change and rerun the affected suite.

**Tech Stack:** TypeScript, Vitest, Next.js route handlers

---

### Task 1: Prove the new batch order

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/shell-batches.test.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/shell-batches.ts`

**Step 1: Write the failing test**

Add an expectation that `backfill-ready-001` appears before `registry-review-001` when both lanes exist.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/shell-batches.test.ts`
Expected: FAIL because the current batch order still starts with `registry-review`.

**Step 3: Write minimal implementation**

Reorder the lane assembly in `buildShellBackfillBatches` so `backfill-ready` batches are emitted before `registry-review`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/shell-batches.test.ts`
Expected: PASS.

### Task 2: Prove the briefing recommendation follows the same rule

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-briefing.test.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-briefing.ts`

**Step 1: Write the failing test**

Add a scenario where both `backfill-ready` and `registry-review` exist and expect the briefing to recommend `backfill-ready`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/backfill-briefing.test.ts`
Expected: FAIL because the current briefing still prefers `registry-review`.

**Step 3: Write minimal implementation**

Change `buildBackfillBriefing` to look for `backfill-ready` before `registry-review`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/backfill-briefing.test.ts`
Expected: PASS.

### Task 3: Update the API-level expectation

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/src/app/api/operators/backfill-briefing/route.test.ts`

**Step 1: Write the failing test**

Expect the route to return a `nextBatch.lane` of `backfill-ready`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/api/operators/backfill-briefing/route.test.ts`
Expected: FAIL because the route still surfaces the old recommendation.

**Step 3: Keep implementation aligned**

No route logic change should be needed once the module behavior is updated. Only adjust code if the failing output proves otherwise.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/api/operators/backfill-briefing/route.test.ts`
Expected: PASS.

### Task 4: Run the focused verification set

**Files:**
- Use: `/Users/hulki/codex/netzentgelte/src/modules/operators/shell-batches.test.ts`
- Use: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-briefing.test.ts`
- Use: `/Users/hulki/codex/netzentgelte/src/app/api/operators/backfill-briefing/route.test.ts`

**Step 1: Run the combined verification**

Run: `pnpm vitest run src/modules/operators/shell-batches.test.ts src/modules/operators/backfill-briefing.test.ts src/app/api/operators/backfill-briefing/route.test.ts`
Expected: PASS.
