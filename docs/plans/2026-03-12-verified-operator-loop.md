# Verified Operator Loop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the batch-oriented hourly backfill automation with a persistent one-operator verification loop and stabilize the cold `main` test run.

**Architecture:** Keep the existing verified-candidate selector as the domain scorer, add a persistent loop-state on top of it, expose that through a dedicated CLI, and repoint the hourly automation to that CLI-driven workflow. The repo keeps existing gates and deploy commands; the automation changes the control plane, not the publication gates.

**Tech Stack:** TypeScript, Vitest, Node CLI via `tsx`, TOML automation config, Next.js verification commands

---

### Task 1: Stabilize cold heavy tests

**Files:**
- Modify: `src/app/page.test.tsx`
- Modify: `src/modules/public-snapshot/build-public-snapshot.test.ts`

**Step 1: Verify the failing/slow behavior context**

Run: `pnpm vitest run src/app/page.test.tsx src/modules/public-snapshot/build-public-snapshot.test.ts`
Expected: green locally after timeout adjustment; these are the two known cold-run hotspots from canonical `main`.

**Step 2: Keep explicit timeout constants in the heavy tests**

Make the per-test timeout large enough for a cold render/build while staying local to the expensive test.

**Step 3: Re-run the focused tests**

Run: `pnpm vitest run src/app/page.test.tsx src/modules/public-snapshot/build-public-snapshot.test.ts`
Expected: PASS

### Task 2: Add verified loop domain state and selection behavior

**Files:**
- Create: `src/modules/operators/verified-operator-loop.ts`
- Create: `src/modules/operators/verified-operator-loop.test.ts`
- Modify: `src/modules/operators/verified-candidate-selector.ts`
- Modify: `src/modules/operators/verified-candidate-selector.test.ts`

**Step 1: Write/finish failing tests for blocked/completed skip behavior**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/verified-operator-loop.test.ts`
Expected: FAIL until the loop logic and dead-end handling are correct.

**Step 2: Implement minimal loop-state behavior**

Add state creation, outcome application, plan generation, and markdown rendering.

**Step 3: Harden candidate blocking**

Use curated registry notes to prevent known pending dead ends from re-entering the autonomous verify lane.

**Step 4: Re-run focused loop tests**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/verified-operator-loop.test.ts src/modules/operators/backfill-koordinator.test.ts`
Expected: PASS

### Task 3: Add CLI and package wiring

**Files:**
- Create: `scripts/automation/verified-operator-loop.ts`
- Modify: `package.json`
- Modify: `src/package-scripts.test.ts`

**Step 1: Write or update the failing package-script expectation**

Run: `pnpm vitest run src/package-scripts.test.ts`
Expected: FAIL until the new loop scripts are added.

**Step 2: Add dry-run/live scripts**

Expose `automation:verified-operator-loop` and `automation:verified-operator-loop:dry-run`.

**Step 3: Re-run script and loop tests**

Run: `pnpm vitest run src/package-scripts.test.ts src/modules/operators/verified-operator-loop.test.ts src/modules/operators/verified-candidate-selector.test.ts`
Expected: PASS

### Task 4: Replace the hourly automation

**Files:**
- Modify: `/Users/hulki/.codex/automations/backfill-koordinator/automation.toml`

**Step 1: Rewrite the automation prompt around one operator per run**

The prompt must:
- use the new loop dry-run first
- either mark a candidate `blocked` with evidence or fully publish it
- run the existing gate/deploy commands
- update loop state only after success or explicit blocking

**Step 2: Keep hourly cadence and existing workspace roots**

No schedule broadening, only control-plane replacement.

### Task 5: Full verification and publish

**Files:**
- Verify all touched files above

**Step 1: Run focused tests**

Run: `pnpm vitest run src/app/page.test.tsx src/modules/public-snapshot/build-public-snapshot.test.ts src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/verified-operator-loop.test.ts src/modules/operators/backfill-koordinator.test.ts src/package-scripts.test.ts`
Expected: PASS

**Step 2: Run full project gates**

Run:
- `pnpm test`
- `pnpm typecheck`
- `pnpm exec eslint src scripts`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

Expected: all green

**Step 3: Commit and push**

Commit only after the verification commands above are green.
