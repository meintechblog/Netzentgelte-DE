# Source Live Audit Runner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Einen Live-Audit-Runner fuer Quellen bauen, der echte Fetch-Signale strukturiert bewertet und bei erfolgreichen Abrufen Snapshots persistiert.

**Architecture:** Ein neues Audit-Modul sitzt auf dem bestehenden Refresh-Stack und klassifiziert Page-/Document-Responses in `ok`, `warning` oder `blocked`. Erfolgreiche Responses werden ueber die vorhandene Snapshot-Persistenz gespeichert, waehrend der Runner die Resultate aggregiert.

**Tech Stack:** TypeScript, Vitest, existing source refresh pipeline, fetch `Response`, filesystem artifact persistence

---

### Task 1: Add failing audit pipeline tests

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/sources/source-live-audit.test.ts`

**Step 1: Write the failing test**

Add tests for:

- successful page/document fetch -> `ok` and `snapshotCount: 2`
- blocked document fetch (`403`) -> `blocked` with `access_blocked`
- unexpected document content type (`text/html`) -> `warning`

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/source-live-audit.test.ts`

Expected: FAIL because the module does not exist yet.

### Task 2: Implement minimal live audit module

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/sources/source-live-audit.ts`

**Step 1: Write minimal implementation**

Implement:

- result types
- response classification helpers
- snapshot persistence on successful responses
- per-source audit result builder

**Step 2: Run test to verify it passes**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/source-live-audit.test.ts`

Expected: PASS

### Task 3: Extend runner summary

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/sources/refresh-runner.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/sources/refresh-runner.test.ts`

**Step 1: Write the failing runner test**

Extend the runner test to expect aggregated audit counts, e.g. `okCount`, `warningCount`, `blockedCount`.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/refresh-runner.test.ts`

Expected: FAIL because the runner does not aggregate audit statuses yet.

**Step 3: Write minimal runner update**

Aggregate per-source results returned by the live audit batch.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/refresh-runner.test.ts`

Expected: PASS

### Task 4: Regression verification

**Files:**
- None

**Step 1: Run targeted suite**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/source-live-audit.test.ts src/modules/sources/refresh-pipeline.test.ts src/modules/sources/refresh-runner.test.ts src/modules/sources/source-health.test.ts src/modules/sources/current-sources.test.ts
```

Expected: PASS

**Step 2: Confirm no publish-path behavior change**

Check that current tariff/operator/source API tests are still green when run together with the changed sources modules.
