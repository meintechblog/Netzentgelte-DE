# Source Refresh Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist fetched source artifacts and snapshot metadata so refresh runs leave a durable audit trail for later human review and re-checks.

**Architecture:** Extend the source catalog so each source has a first-class page URL, then add a refresh orchestration layer that fetches document artifacts, stores them on disk, inserts `source_snapshots`, updates source freshness timestamps, and records ingest runs. Keep the refresh path scriptable from the LXC so periodic follow-up sessions can re-run it without reconstructing context.

**Tech Stack:** TypeScript, Next.js app repo, Drizzle ORM, Postgres/PostGIS, Node.js filesystem APIs, Vitest

---

### Task 1: Add first-class source page URLs to the catalog

**Files:**
- Create: `drizzle/0004_source_catalog_page_url.sql`
- Modify: `src/db/schema/sources.ts`
- Modify: `src/db/schema/schema.test.ts`
- Modify: `src/modules/operators/registry-import.ts`
- Modify: `src/modules/operators/registry-import.test.ts`
- Modify: `scripts/registry/import-registry.ts`

**Step 1: Write the failing tests**

- Add a schema assertion that `source_catalog` exposes `page_url`.
- Add a registry import assertion that source rows carry `pageUrl` from the curated source document.

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run src/db/schema/schema.test.ts src/modules/operators/registry-import.test.ts
```

Expected: FAIL because `pageUrl` is not yet present in the schema/import payload.

**Step 3: Write minimal implementation**

- Add the migration for `source_catalog.page_url`.
- Update the schema model and registry import payload.
- Upsert `page_url` in the DB import script.

**Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run src/db/schema/schema.test.ts src/modules/operators/registry-import.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add drizzle/0004_source_catalog_page_url.sql src/db/schema/sources.ts src/db/schema/schema.test.ts src/modules/operators/registry-import.ts src/modules/operators/registry-import.test.ts scripts/registry/import-registry.ts
git commit -m "feat: persist source page urls"
```

### Task 2: Persist source snapshots and artifacts during refresh runs

**Files:**
- Modify: `src/modules/sources/refresh-service.ts`
- Create: `src/modules/sources/refresh-pipeline.ts`
- Create: `src/modules/sources/refresh-pipeline.test.ts`

**Step 1: Write the failing test**

- Add a refresh pipeline test that expects:
  - artifact bytes written under `data/artifacts/...`
  - a snapshot insert request containing hash, storage path, mime type, page URL and file URL
  - source freshness timestamps updated
  - an ingest run summary recorded

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run src/modules/sources/refresh-pipeline.test.ts
```

Expected: FAIL because no orchestration exists yet.

**Step 3: Write minimal implementation**

- Expand the refresh code so fetch + hash + storage path building return artifact bytes.
- Add a pipeline/orchestrator that persists the artifact file and delegates DB writes through a gateway.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run src/modules/sources/refresh-service.test.ts src/modules/sources/refresh-pipeline.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/sources/refresh-service.ts src/modules/sources/refresh-pipeline.ts src/modules/sources/refresh-pipeline.test.ts
git commit -m "feat: persist source refresh snapshots"
```

### Task 3: Add a DB-backed refresh CLI for repeatable update runs

**Files:**
- Create: `scripts/sources/refresh-sources.ts`
- Modify: `package.json`
- Modify: `docs/runbooks/source-refresh.md`

**Step 1: Write the failing test**

- Add a pipeline-level integration-style test or argument parser test that proves the CLI can filter by source slug and produces a structured summary.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run src/modules/sources/refresh-pipeline.test.ts
```

Expected: FAIL because the CLI entrypoint and DB-backed orchestration are missing.

**Step 3: Write minimal implementation**

- Add a CLI script that resolves `DATABASE_URL`, loads source rows from `source_catalog`, runs the refresh pipeline, stores snapshots, updates source timestamps, and records ingest runs.
- Expose it as `pnpm sources:refresh`.
- Extend the runbook with the exact operational command and expected outputs.

**Step 4: Run tests to verify it passes**

Run:

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

Expected: PASS

**Step 5: Commit**

```bash
git add scripts/sources/refresh-sources.ts package.json docs/runbooks/source-refresh.md
git commit -m "feat: add source refresh cli"
```
