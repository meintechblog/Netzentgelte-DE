# Backfill Ready 013 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a small reusable batch workset step for `backfill-ready-*` batches and use it to drive the first real enrichment pass for `backfill-ready-013`.

**Architecture:** Extend the existing operator batch tooling with a deterministic workset builder that surfaces the exact shells, URLs, and readiness state for a named batch. Keep the automation narrow: support evidence-first registry filling for `backfill-ready-013` without attempting full tariff extraction automation yet.

**Tech Stack:** TypeScript, Next.js project modules, Vitest, existing operator shell catalog and backfill batch builders

---

### Task 1: Add a failing test for batch workset generation

**Files:**
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/batch-workset.test.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/shell-batches.ts`
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/batch-workset.test.ts`

**Step 1: Write the failing test**

Add a test that loads operator shells, resolves `backfill-ready-013`, and expects a normalized workset object with:

- `batchId`
- `lane`
- `operatorCount`
- all 25 operators
- stable `hostname` derivation
- stable classification of the current shell/source/tariff status

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/batch-workset.test.ts`

Expected: FAIL because the batch workset builder does not exist yet.

**Step 3: Write minimal implementation**

Create a small module that takes a named `ShellBackfillBatch` plus its operators and returns a deterministic workset.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/batch-workset.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/operators/batch-workset.test.ts src/modules/operators/batch-workset.ts
git commit -m "feat: add backfill batch workset builder"
```

### Task 2: Expose the workset through a project-facing entry point

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/scripts/automation/backfill-koordinator.ts`
- Modify: `/Users/hulki/codex/netzentgelte/package.json`
- Test: `/Users/hulki/codex/netzentgelte/src/package-scripts.test.ts`

**Step 1: Write the failing test**

Add a script-level expectation for a new command that can print or prepare the workset for a named batch.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/package-scripts.test.ts`

Expected: FAIL because the package script is missing.

**Step 3: Write minimal implementation**

Add a script such as `pnpm backfill:workset -- backfill-ready-013` that emits the deterministic workset JSON.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/package-scripts.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add package.json scripts/automation/backfill-koordinator.ts src/package-scripts.test.ts
git commit -m "feat: expose backfill batch workset command"
```

### Task 3: Use the workset to prepare Batch 013 enrichment

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/docs/coordination/dispatches/` only if a new local dispatch artifact is needed
- Modify: `/Users/hulki/codex/netzentgelte/data/source-registry/operator-shells.seed.json`
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/shell-catalog.test.ts`
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/shell-import.test.ts`

**Step 1: Write the failing test**

Add or tighten a test around the specific `013` operators whose shell metadata should advance after the enrichment pass.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/shell-catalog.test.ts src/modules/operators/shell-import.test.ts`

Expected: FAIL until the seed registry reflects the intended Batch 013 upgrades.

**Step 3: Write minimal implementation**

Advance only the operators for which official evidence is available in-session. Keep insufficient evidence on `pending`.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/shell-catalog.test.ts src/modules/operators/shell-import.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add data/source-registry/operator-shells.seed.json src/modules/operators/shell-catalog.test.ts src/modules/operators/shell-import.test.ts
git commit -m "feat: enrich backfill-ready-013 operators"
```

### Task 4: Run focused and project-level verification

**Files:**
- Modify: none unless a failing verification requires a targeted fix
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/batch-workset.test.ts`
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/automation-commands.test.ts`
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.test.ts`
- Test: `/Users/hulki/codex/netzentgelte/src/package-scripts.test.ts`

**Step 1: Run focused tests**

Run:

```bash
pnpm vitest run \
  src/modules/operators/batch-workset.test.ts \
  src/modules/operators/automation-commands.test.ts \
  src/modules/operators/backfill-koordinator.test.ts \
  src/package-scripts.test.ts \
  src/modules/operators/shell-catalog.test.ts \
  src/modules/operators/shell-import.test.ts
```

Expected: PASS

**Step 2: Run type verification**

Run: `pnpm typecheck`

Expected: PASS

**Step 3: Commit**

```bash
git add .
git commit -m "chore: verify backfill-ready-013 workset flow"
```
