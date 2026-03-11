# Backfill Koordinator Vollautomat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and activate a reliable hourly coordinator that keeps filling missing grid operators, promotes ready operators first, and only deploys verified changes.

**Architecture:** Add a project-owned coordinator script with a dry-run mode, persist runtime state in `docs/coordination`, and bind it to a Codex automation definition. Reuse the existing batch APIs, pending-public model, import scripts, and static deploy path so the automation drives the current product instead of inventing a parallel workflow.

**Tech Stack:** TypeScript, Node.js, Vitest, Next.js, pnpm, shell deploy scripts, Codex automation TOML

---

### Task 1: Define the coordinator script contract

**Files:**
- Create: `/Users/hulki/codex/netzentgelte/scripts/automation/backfill-koordinator.ts`
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.ts`
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.test.ts`

**Step 1: Write the failing test**

Cover one minimal run where:
- completed work is integrated first
- the next dispatch prefers `backfill-ready`
- a dry-run reports the planned actions without mutating state

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/backfill-koordinator.test.ts`
Expected: FAIL because the module does not exist yet.

**Step 3: Write minimal implementation**

Build a coordinator service that:
- loads `claims-board`
- reads current batches and briefing
- decides `integrate`, `dispatch`, `gate`, `deploy`, or `blocked`
- supports a dry-run summary

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/backfill-koordinator.test.ts`
Expected: PASS.

### Task 2: Persist coordinator state cleanly

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/docs/coordination/claims-board.json`
- Modify: `/Users/hulki/codex/netzentgelte/docs/coordination/claims-board.md`
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/claims-board.ts`
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/claims-board.test.ts`

**Step 1: Write the failing test**

Prove that the state layer can:
- read an empty or existing board
- record a blocked gate
- clear the blocker on the next green run
- keep completed-awaiting-integration claims ahead of new dispatch

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/claims-board.test.ts`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Add a small state module so the coordinator does not manipulate raw JSON/Markdown inline.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/claims-board.test.ts`
Expected: PASS.

### Task 3: Add gate and deploy command assembly

**Files:**
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/automation-commands.ts`
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/automation-commands.test.ts`
- Modify: `/Users/hulki/codex/netzentgelte/scripts/public/deploy-public-static.sh` only if a gap appears

**Step 1: Write the failing test**

Assert the coordinator assembles these commands in order:
- `pnpm test`
- `pnpm typecheck`
- `pnpm exec eslint src scripts`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`
- LXC sync/restart
- `pnpm registry:import`
- `pnpm shells:import`
- `bash scripts/public/deploy-public-static.sh`

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/automation-commands.test.ts`
Expected: FAIL because the command builder does not exist yet.

**Step 3: Write minimal implementation**

Create a single command-plan helper used by the coordinator and later by the automation prompt.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/automation-commands.test.ts`
Expected: PASS.

### Task 4: Recreate the Codex automation definition

**Files:**
- Create: `/Users/hulki/.codex/automations/backfill-koordinator/automation.toml`
- Modify: `/Users/hulki/.codex/memory.md`
- Modify: `/Users/hulki/codex/netzentgelte/docs/runbooks/operator-curation-model.md`
- Modify: `/Users/hulki/codex/netzentgelte/docs/runbooks/lxc-release.md`

**Step 1: Write the automation contract**

The prompt must:
- run from `/Users/hulki/codex/netzentgelte`
- call the project coordinator dry-run first
- integrate finished work before dispatch
- use the current gate and deploy sequence
- stop on blockers and report them

**Step 2: Verify the TOML parses**

Run: `python3 - <<'PY'\nimport tomllib, pathlib\npath = pathlib.Path('/Users/hulki/.codex/automations/backfill-koordinator/automation.toml')\nprint(tomllib.loads(path.read_text()))\nPY`
Expected: PASS.

### Task 5: Add a full project dry-run

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/package.json`
- Test: `/Users/hulki/codex/netzentgelte/src/package-scripts.test.ts`

**Step 1: Write the failing test**

Add a script expectation for a coordinator entry point using `node --import tsx`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/package-scripts.test.ts`
Expected: FAIL because the script is not listed yet.

**Step 3: Write minimal implementation**

Add scripts like:
- `automation:backfill-koordinator`
- `automation:backfill-koordinator:dry-run`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/package-scripts.test.ts`
Expected: PASS.

### Task 6: Run the focused verification and one operational dry-run

**Files:**
- Use: `/Users/hulki/codex/netzentgelte`

**Step 1: Run focused tests**

Run:
- `pnpm vitest run src/modules/operators/backfill-koordinator.test.ts src/modules/operators/claims-board.test.ts src/modules/operators/automation-commands.test.ts src/package-scripts.test.ts`

Expected: PASS.

**Step 2: Run coordinator dry-run**

Run:
- `pnpm automation:backfill-koordinator:dry-run`

Expected: PASS and a readable action plan without mutation.

**Step 3: Run project gate**

Run:
- `pnpm test`
- `pnpm typecheck`
- `pnpm exec eslint src scripts`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

Expected: PASS.

### Task 7: Activate the hourly automation

**Files:**
- Modify if needed: `/Users/hulki/.codex/automations/backfill-koordinator/automation.toml`

**Step 1: Final sanity check**

Verify:
- `status = "ACTIVE"`
- hourly schedule
- cwd includes `/Users/hulki/codex/netzentgelte`
- prompt matches the new coordinator script

**Step 2: Keep the first live run observable**

Leave a short note in docs/runbook telling us where to inspect the next run if it blocks.
