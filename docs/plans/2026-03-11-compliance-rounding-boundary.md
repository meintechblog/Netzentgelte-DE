# Compliance Rounding Boundary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the Modul-3 NT/ST corridor check so boundary cases like Netze BW are evaluated with kaufmännisch rounded ratios.

**Architecture:** Keep the existing compliance evaluator and change only the ratio comparison layer. Add one evaluator-level regression for the raw ratio boundary and one view-model regression for the real Netze-BW row so the public UI stays aligned with the evaluator.

**Tech Stack:** TypeScript, Vitest, Next.js view models

---

### Task 1: Add failing boundary tests

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/compliance/modul-3-evaluator.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/lib/view-models/tariffs.test.ts`

**Step 1: Write the failing evaluator test**

Add a test for `NT 3.03` and `ST 7.57` that expects no corridor violation after kaufmännisch rounding.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/compliance/modul-3-evaluator.test.ts src/lib/view-models/tariffs.test.ts`

Expected: FAIL because the current evaluator still reports a violation.

### Task 2: Implement rounded ratio comparison

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/compliance/modul-3-evaluator.ts`

**Step 1: Write minimal implementation**

Round the computed ratio kaufmännisch to two decimal places before applying the configured `minRatio` / `maxRatio` corridor check.

**Step 2: Run tests to verify they pass**

Run: `pnpm test src/modules/compliance/modul-3-evaluator.test.ts src/lib/view-models/tariffs.test.ts`

Expected: PASS

### Task 3: Full verification and rollout

**Files:**
- None

**Step 1: Run verification**

Run:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test src/modules/compliance/modul-3-evaluator.test.ts src/lib/view-models/tariffs.test.ts`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

**Step 2: Sync to LXC and verify**

Update the changed compliance files on `root@192.168.3.178`, rebuild, restart, and confirm Netze BW no longer shows the corridor violation.

**Step 3: Deploy public static build**

Refresh the static public artifacts on Hetzner and verify `https://kigenerated.de/netzentgelte/`.

**Step 4: Commit**

```bash
git add src/modules/compliance/modul-3-evaluator.ts src/modules/compliance/modul-3-evaluator.test.ts src/lib/view-models/tariffs.test.ts docs/plans/2026-03-11-compliance-rounding-boundary.md
git commit -m "fix: round compliance corridor ratios"
```
