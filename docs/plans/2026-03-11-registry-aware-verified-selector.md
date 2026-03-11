# Registry-Aware Verified Selector Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the verified-first coordinator choose only operators that can realistically be promoted to the homepage in the same run by combining shell evidence with curated registry state.

**Architecture:** Extend the verified-candidate selector to accept both shell and registry context. Use the registry to downgrade known `pending` operators without structured Modul-3 matrices, keep shell-only candidates possible, and wire the same selector into the coordinator CLI dry-run.

**Tech Stack:** TypeScript, Vitest, Next.js seed-backed registry modules

---

### Task 1: Add failing selector tests for registry-aware eligibility

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/verified-candidate-selector.test.ts`
- Test: `/Users/hulki/codex/netzentgelte/src/modules/operators/verified-candidate-selector.test.ts`

**Step 1: Write the failing test**

Add expectations that:

- a shell like `egt-energie` with a known `pending` registry entry but no structured `bands/timeWindows` is not `verification-ready`
- a structured registry-backed candidate stays eligible
- a shell-only candidate without registry entry can still be selected

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts`

Expected: FAIL because the selector currently ignores registry state.

**Step 3: Write minimal implementation**

Refactor the selector input shape so tests can pass registry context into the selector.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/verified-candidate-selector.ts
git commit -m "test: add registry-aware verified selector cases"
```

### Task 2: Implement registry-aware selector logic

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/verified-candidate-selector.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.test.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.ts`
- Modify: `/Users/hulki/codex/netzentgelte/scripts/automation/backfill-koordinator.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/registry.ts`

**Step 1: Implement eligibility helpers**

Add helpers that detect:

- registry entry exists
- registry entry is structured enough for verify-lane consideration
- registry entry is known pending with only fallback/no matrix
- shell evidence is explicitly provisional

**Step 2: Update selector signatures**

Make the selector consume:

- `shells`
- `registryEntriesBySlug` or `registryEntries`

Keep the output contract stable for the coordinator.

**Step 3: Update coordinator usage**

Load the registry in the automation script and pass it into the selector used by the coordinator plan.

**Step 4: Run focused tests**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/backfill-koordinator.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/operators/verified-candidate-selector.ts src/modules/operators/backfill-koordinator.ts src/modules/operators/backfill-koordinator.test.ts scripts/automation/backfill-koordinator.ts
git commit -m "feat: make verified selector registry-aware"
```

### Task 3: Prove the dry-run no longer selects dead-end pending operators

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.test.ts`
- Test: `/Users/hulki/codex/netzentgelte/scripts/automation/backfill-koordinator.ts`

**Step 1: Add the failing coordinator expectation**

Assert that a known registry-pending shell without structured matrix does not become the selected verify target when stronger candidates exist.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/backfill-koordinator.test.ts`

Expected: FAIL before the coordinator wiring is updated.

**Step 3: Implement the minimal coordinator fix**

Wire the registry-aware selector into the coordinator and keep the plan output unchanged.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/backfill-koordinator.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/operators/backfill-koordinator.test.ts src/modules/operators/backfill-koordinator.ts scripts/automation/backfill-koordinator.ts
git commit -m "test: prove coordinator skips dead-end verify targets"
```

### Task 4: Validate the project-level behavior

**Files:**
- Modify if needed: `/Users/hulki/codex/netzentgelte/docs/runbooks/operator-curation-model.md`

**Step 1: Run focused project checks**

Run:

```bash
pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/backfill-koordinator.test.ts src/modules/operators/current-catalog.test.ts src/modules/operators/publication-integrity.test.ts
pnpm automation:backfill-koordinator:dry-run
```

Expected:

- tests pass
- dry-run no longer selects `egt-energie`

**Step 2: Run broad gates**

Run:

```bash
pnpm test
pnpm typecheck
pnpm exec eslint src scripts
```

Expected: PASS

**Step 3: Commit**

```bash
git add src/modules/operators scripts/automation docs/runbooks
git commit -m "chore: validate registry-aware verified selector"
```
