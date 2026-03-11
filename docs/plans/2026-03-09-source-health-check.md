# Source Health Check Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Einen deterministischen Source-Health-Report fuer aktuelle Quellen bereitstellen, damit blockierte, source-only oder auffaellige Betreiberquellen frueh sichtbar werden.

**Architecture:** Ein neues `source-health`-Modul bewertet lokale Source-Evidenz ohne Live-Netzwerkzugriff. `current-sources` baut den Report fuer Seed- und DB-Quellen, und der bestehende Sources-API-Serializer liefert ihn an die UI weiter.

**Tech Stack:** TypeScript, Vitest, Seed registry, existing current-sources/source serializer pipeline

---

### Task 1: Add failing health-rule tests

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/sources/source-health.test.ts`

**Step 1: Write the failing test**

Add tests for:

- verified PDF source -> `status: "ok"`
- source with Cloudflare/manual-evidence wording -> `status: "blocked"` and `access_blocked`
- `pending` source-only fallback -> `status: "warning"` and `pending_source_only`
- checked source without snapshot artifacts -> `status: "warning"` and `snapshot_missing`

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/source-health.test.ts`

Expected: FAIL because the module does not exist yet.

### Task 2: Implement minimal source-health module

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/sources/source-health.ts`

**Step 1: Write minimal implementation**

Implement:

- health report types
- issue-key types
- helper to inspect URL/document patterns
- helper to inspect notes/fallback text for blocked/manual-evidence signals
- builder that returns `ok`, `warning`, or `blocked`

**Step 2: Run test to verify it passes**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/source-health.test.ts`

Expected: PASS

### Task 3: Integrate health report into current sources

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/sources/current-sources.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/api/serializers.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/sources/current/route.test.ts`

**Step 1: Write the failing integration test**

Extend the API test so returned items include `healthReport`, and assert:

- `syna` -> `blocked`
- a verified operator such as `netze-bw` or `avacon-netz` -> `ok`

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/app/api/sources/current/route.test.ts`

Expected: FAIL because `healthReport` is not serialized yet.

**Step 3: Write minimal integration code**

Attach `healthReport` in seed and DB branches inside `current-sources.ts`, then serialize it in `serializers.ts`.

**Step 4: Run test to verify it passes**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/app/api/sources/current/route.test.ts`

Expected: PASS

### Task 4: Regression verification

**Files:**
- None

**Step 1: Run targeted suite**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/modules/sources/source-health.test.ts src/modules/sources/current-sources.test.ts src/modules/sources/source-catalog.test.ts src/app/api/sources/current/route.test.ts src/modules/operators/registry.test.ts
```

Expected: PASS

**Step 2: Confirm seed-backed status expectations**

Check that:

- `verified` count remains unchanged
- published operators remain unchanged
- health reporting does not alter tariff publication behavior
