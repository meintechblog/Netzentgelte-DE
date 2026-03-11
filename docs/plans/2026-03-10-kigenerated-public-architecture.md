# kigenerated.de Public Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish Netzentgelte Deutschland reliably under `kigenerated.de/netzentgelte` as a static read app, while keeping development, data ingestion, and validation on `CT128`.

**Architecture:** The existing Next.js application will be split into a build-time public snapshot generator on `CT128` and a static public site served from the Hetzner webspace. Published operator, tariff, source, compliance, and map data will be serialized into versioned JSON at build time so the public site no longer depends on a second Node runtime, Apache reverse proxy rules, or direct DB access from the shared hosting environment.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, Drizzle/Postgres/PostGIS, static export, rsync/tar over SSH

---

### Task 1: Define the public snapshot contract

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/public-snapshot/schema.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/public-snapshot/schema.test.ts`

**Step 1: Write the failing test**

Add a schema-level test that requires:
- `generatedAt`
- `operatorCount`
- `operators`
- `map`
- `sources`
- `compliance`

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/public-snapshot/schema.test.ts`
Expected: FAIL because no public snapshot contract exists yet.

**Step 3: Write minimal implementation**

Create a typed contract for the public JSON payload used by the static site.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/public-snapshot/schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/public-snapshot/schema.ts src/modules/public-snapshot/schema.test.ts
git commit -m "feat: add public snapshot contract"
```

### Task 2: Build a public snapshot from publishable data

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/public-snapshot/build-public-snapshot.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/public-snapshot/build-public-snapshot.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/operators/current-catalog.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/tariffs/endcustomer-catalog.ts`

**Step 1: Write the failing test**

Assert that the builder includes only `verified/publishable` operators and embeds:
- tariff matrix data
- endcustomer modules where complete
- source metadata
- compliance fields
- map geometry references

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/public-snapshot/build-public-snapshot.test.ts`
Expected: FAIL because no snapshot builder exists.

**Step 3: Write minimal implementation**

Create a builder that composes the existing public catalogs into one normalized payload.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/public-snapshot/build-public-snapshot.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/public-snapshot/build-public-snapshot.ts src/modules/public-snapshot/build-public-snapshot.test.ts src/modules/operators/current-catalog.ts src/modules/tariffs/endcustomer-catalog.ts
git commit -m "feat: build public snapshot from published data"
```

### Task 3: Add a build-time export command

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/scripts/public/export-public-snapshot.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/package.json`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/public-snapshot/export-public-snapshot.test.ts`

**Step 1: Write the failing test**

Assert that the export command writes versioned public files into a deterministic output directory such as:
- `public/netzentgelte/snapshot.json`
- `public/netzentgelte/meta.json`

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/public-snapshot/export-public-snapshot.test.ts`
Expected: FAIL because no export command exists.

**Step 3: Write minimal implementation**

Add a script like `pnpm export:public` that serializes the snapshot before the static build.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/public-snapshot/export-public-snapshot.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/public/export-public-snapshot.ts package.json src/modules/public-snapshot/export-public-snapshot.test.ts
git commit -m "feat: add public snapshot export command"
```

### Task 4: Refactor the public UI to read static snapshot data

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/page.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/components/operator-explorer.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/components/operator-map.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/components/tariff-table.tsx`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/lib/public-snapshot-loader.ts`

**Step 1: Write the failing test**

Update page/component tests to read from the generated public snapshot instead of live route handlers.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/app/page.test.tsx src/components/tariff-table.test.tsx src/components/operator-map.test.tsx`
Expected: FAIL because the page still depends on runtime APIs/catalog loaders.

**Step 3: Write minimal implementation**

Load the build-time snapshot into the page and flow it through the existing interactive components.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/app/page.test.tsx src/components/tariff-table.test.tsx src/components/operator-map.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/operator-explorer.tsx src/components/operator-map.tsx src/components/tariff-table.tsx src/lib/public-snapshot-loader.ts
git commit -m "feat: serve public UI from static snapshot"
```

### Task 5: Make the app statically exportable under `/netzentgelte`

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/next.config.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/lib/base-path.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/layout.tsx`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/not-found.tsx`

**Step 1: Write the failing test**

Add assertions for:
- base path `/netzentgelte`
- asset URLs under `/netzentgelte/_next/...`
- no server-only runtime requirement for the public page

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/app/page.test.tsx`
Expected: FAIL because the current app still targets runtime deployment assumptions.

**Step 3: Write minimal implementation**

Set the static export configuration and normalize all public paths to `/netzentgelte`.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/app/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add next.config.ts src/lib/base-path.ts src/app/layout.tsx src/app/not-found.tsx
git commit -m "feat: make public app exportable under netzentgelte path"
```

### Task 6: Add CT128 release workflow for static publishing

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/kigenerated-static-rollout.md`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/operator-curation-model.md`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/scripts/public/deploy-public-static.sh`

**Step 1: Write the failing test**

Create a smoke script or test fixture that expects a release directory containing only static assets and snapshot files.

**Step 2: Run test to verify it fails**

Run: `bash scripts/public/deploy-public-static.sh --dry-run`
Expected: FAIL because no static deploy script exists yet.

**Step 3: Write minimal implementation**

Document and script:
- build on `CT128`
- upload exported site to `/usr/home/bpjwjy/apps/netzentgelte`
- atomically sync or swap the public directory
- optionally add a simple redirect from `/netzentgelte-deutschland`

**Step 4: Run test to verify it passes**

Run: `bash scripts/public/deploy-public-static.sh --dry-run`
Expected: PASS

**Step 5: Commit**

```bash
git add docs/runbooks/kigenerated-static-rollout.md docs/runbooks/operator-curation-model.md scripts/public/deploy-public-static.sh
git commit -m "docs: add static rollout workflow for kigenerated"
```

### Task 7: Verify export and public rollout

**Files:**
- Verify only

**Step 1: Run quality gates on CT128**

Run: `pnpm typecheck && pnpm test && pnpm build && pnpm export:public`
Expected: PASS

**Step 2: Upload and publish the static site**

Run the new deploy script against the Hetzner webspace.
Expected: static files present under the public path.

**Step 3: Verify public URLs**

Run:
- `curl -I https://kigenerated.de/netzentgelte`
- `curl -fsS https://kigenerated.de/netzentgelte | grep -i '<title>Netzentgelte Deutschland'`
- `curl -I https://kigenerated.de/prince2-vorbereitung`

Expected:
- Netzentgelte returns `200`
- title contains `Netzentgelte Deutschland`
- prince2 remains `200`

**Step 4: Commit**

```bash
git add .
git commit -m "chore: publish static kigenerated rollout"
```
