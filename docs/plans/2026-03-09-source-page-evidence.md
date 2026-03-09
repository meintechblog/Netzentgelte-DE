# Source Page Evidence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist page-level source evidence alongside document artifacts so source finality claims remain reviewable.

**Architecture:** Extend the existing snapshot pipeline rather than inventing a new evidence subsystem. Each refresh stores two artifacts per source, tagged by role, and the current-sources read model surfaces both artifacts distinctly to the UI and API.

**Tech Stack:** Next.js, TypeScript, Vitest, Drizzle, PostgreSQL

---

### Task 1: Lock the new evidence model in tests

**Files:**
- Modify: `src/modules/sources/refresh-service.test.ts`
- Modify: `src/modules/sources/refresh-pipeline.test.ts`
- Modify: `src/modules/sources/current-sources.test.ts`

**Step 1: Write failing tests**

Assert that source refresh creates both `page` and `document` snapshots, and that current source rows expose separate page/document artifact URLs.

**Step 2: Run targeted tests to verify they fail**

Run:
- `pnpm vitest run src/modules/sources/refresh-service.test.ts`
- `pnpm vitest run src/modules/sources/refresh-pipeline.test.ts`
- `pnpm vitest run src/modules/sources/current-sources.test.ts`

Expected: FAIL because the current model only stores one artifact per source.

### Task 2: Extend the persistence and refresh pipeline

**Files:**
- Modify: `src/db/schema/sources.ts`
- Create: `drizzle/0005_source_snapshot_artifact_kind.sql`
- Modify: `src/modules/sources/refresh-service.ts`
- Modify: `src/modules/sources/refresh-pipeline.ts`
- Modify: `scripts/sources/refresh-sources.ts`

**Step 1: Add snapshot role**

Store whether a snapshot is `page` or `document`.

**Step 2: Generate two snapshots per refresh**

Fetch the page HTML from `pageUrl`, fetch the document from `documentUrl`, persist both with deterministic storage paths.

**Step 3: Run targeted tests**

Run the same Vitest commands again.
Expected: PASS

### Task 3: Surface the new evidence in API and UI

**Files:**
- Modify: `src/modules/sources/current-sources.ts`
- Modify: `src/components/source-review-table.tsx`
- Update related API route tests if needed

**Step 1: Expose separate page/document snapshot metadata**

Return distinct artifact URLs and hashes for each role without breaking existing review status behavior.

**Step 2: Update the source review table**

Show both the stored page snapshot and the stored document snapshot.

**Step 3: Full verification**

Run:
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

Expected: all commands exit `0`
