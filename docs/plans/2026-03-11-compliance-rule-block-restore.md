# Compliance Rule Block Restore Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the previously shipped collapsible `Regelwerk` block with compliance filter counters in the current public Netzentgelte UI.

**Architecture:** Reuse the current `OperatorExplorer` compliance section and reintroduce only the missing interaction state from the older `bdbba3c` implementation. Keep the current data flow and styling, but restore the collapsed-by-default rule panel and button counters derived from the already filtered operator set.

**Tech Stack:** Next.js App Router, React client components, Vitest, Testing Library

---

### Task 1: Add failing explorer tests for the restored compliance block

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/components/operator-explorer.test.tsx`

**Step 1: Write the failing test**

Add assertions that:
- the `Regelwerk aufklappen` button exists by default
- the detailed rule list is hidden by default
- the filter buttons render `Alle (n)`, `Regelkonform (n)`, `Mit Verstößen (n)`, `Nicht bewertbar (n)`
- clicking the toggle reveals the rules

**Step 2: Run test to verify it fails**

Run: `pnpm test src/components/operator-explorer.test.tsx`

Expected: FAIL because the current block is always open and buttons have no counters.

### Task 2: Restore the collapsible compliance block behavior

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/components/operator-explorer.tsx`

**Step 1: Write minimal implementation**

Restore:
- local `isComplianceOpen` state
- derived compliance counts from the current search-filtered rows
- toggle button and collapsible panel
- button labels with counts

Do not change the surrounding page structure or the operator filtering model.

**Step 2: Run test to verify it passes**

Run: `pnpm test src/components/operator-explorer.test.tsx`

Expected: PASS

### Task 3: Verify and deploy

**Files:**
- Modify only if needed: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/hetzner-prod-rollout.md`

**Step 1: Run focused verification**

Run:
- `pnpm test src/components/operator-explorer.test.tsx src/app/page.test.tsx`
- `pnpm lint`
- `pnpm typecheck`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

Expected: all pass

**Step 2: Roll out**

- Sync the changed source to `CT128` and rerun the focused verification there.
- Rebuild the static public snapshot.
- Copy the refreshed public artifacts to Hetzner for `/netzentgelte/`.

**Step 3: Verify production**

Check:
- `https://kigenerated.de/netzentgelte/`
- `http://192.168.3.178:3000`

Expected:
- `Regelwerk` is collapsed by default
- the buttons show counts
- opening the block reveals the detailed rule list
