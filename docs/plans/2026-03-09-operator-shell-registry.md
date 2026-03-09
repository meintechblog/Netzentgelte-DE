# Operator Shell Registry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a DB-backed shell registry for all German distribution grid operators so discovery, source finding, geo work, and tariff parsing can scale independently.

**Architecture:** Add an internal `operator_shells` layer beside the existing publishable tariff models. Import registry-level operator records into this layer first, enrich them with discovery/source status, and expose a read model/API without weakening the existing verified-only publication gates.

**Tech Stack:** Next.js, TypeScript, Vitest, Drizzle ORM, PostgreSQL, existing source-registry JSON seeds

---

### Task 1: Add Shell Registry Schema

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/db/schema/operator-shells.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/db/schema/index.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/drizzle/0006_operator_shells.sql`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/db/schema/operator-shells.test.ts`

**Step 1: Write the failing test**

Create a schema test that asserts:
- `operatorShells` exists
- columns for `slug`, `operatorName`, `websiteUrl`, `regionLabel`
- status columns for `shellStatus`, `coverageStatus`, `sourceStatus`, `tariffStatus`
- unique slug

**Step 2: Run test to verify it fails**

Run: `pnpm test src/db/schema/operator-shells.test.ts`
Expected: FAIL because the schema file/table does not exist yet

**Step 3: Write minimal implementation**

- Define the Drizzle table
- Add enums/status fields
- Export it from `index.ts`
- Create SQL migration

**Step 4: Run test to verify it passes**

Run: `pnpm test src/db/schema/operator-shells.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/db/schema/operator-shells.ts src/db/schema/index.ts drizzle/0006_operator_shells.sql src/db/schema/operator-shells.test.ts
git commit -m "feat: add operator shell schema"
```

### Task 2: Add Shell Registry Seed and Parser

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/data/source-registry/operator-shells.seed.json`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/shell-registry.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/shell-registry.test.ts`

**Step 1: Write the failing test**

Create a parser test that asserts:
- shell entries parse from JSON
- status defaults are normalized
- slugs are unique
- the seed contains more operators than the current published tariff registry

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/shell-registry.test.ts`
Expected: FAIL because the seed/parser does not exist

**Step 3: Write minimal implementation**

- Add a first shell seed with a meaningful batch, not just current published operators
- Parse via Zod
- Export typed accessors and stats helpers

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/operators/shell-registry.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add data/source-registry/operator-shells.seed.json src/modules/operators/shell-registry.ts src/modules/operators/shell-registry.test.ts
git commit -m "feat: add operator shell seed registry"
```

### Task 3: Persist Shells into PostgreSQL

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/shell-persist.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/scripts/registry/import-shell-registry.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/shell-persist.test.ts`

**Step 1: Write the failing test**

Create a persistence test that asserts:
- inserting shell rows is idempotent
- a second import updates mutable fields instead of duplicating
- status fields survive round-trips

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/shell-persist.test.ts`
Expected: FAIL because the persistence/import path does not exist

**Step 3: Write minimal implementation**

- Add a DB writer for shell rows
- Upsert by slug
- Add a CLI command for import

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/operators/shell-persist.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/operators/shell-persist.ts scripts/registry/import-shell-registry.ts src/modules/operators/shell-persist.test.ts
git commit -m "feat: persist operator shell registry"
```

### Task 4: Add Shell Read Model and API

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/shell-catalog.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/operators/shells/route.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/shell-catalog.test.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/operators/shells/route.test.ts`

**Step 1: Write the failing test**

Create read-model/API tests that assert:
- shells are returned with status fields
- search/filter can later operate on shell status
- the route works in seed mode and DB mode

**Step 2: Run test to verify it fails**

Run:
- `pnpm test src/modules/operators/shell-catalog.test.ts`
- `pnpm test src/app/api/operators/shells/route.test.ts`

Expected: FAIL because the read model and route do not exist

**Step 3: Write minimal implementation**

- Build shell read model
- Add API serializer
- Keep published tariff routes unchanged

**Step 4: Run test to verify it passes**

Run the same two commands again
Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/operators/shell-catalog.ts src/app/api/operators/shells/route.ts src/modules/operators/shell-catalog.test.ts src/app/api/operators/shells/route.test.ts
git commit -m "feat: publish operator shell API"
```

### Task 5: Surface Shell Stats in the App

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.tsx`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-shell-summary.tsx`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-shell-summary.test.tsx`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.test.tsx`

**Step 1: Write the failing test**

Create UI tests that assert:
- the page shows shell coverage stats
- the UI differentiates between published operators and shell coverage
- no unverified tariff rows are accidentally exposed

**Step 2: Run test to verify it fails**

Run:
- `pnpm test src/components/operator-shell-summary.test.tsx`
- `pnpm test src/app/page.test.tsx`

Expected: FAIL because the summary block does not exist yet

**Step 3: Write minimal implementation**

- Add a compact shell summary block
- Show counts such as `erfasst`, `Quellen gefunden`, `verifiziert`, `öffentlich`
- Keep the public tariff matrix unchanged

**Step 4: Run test to verify it passes**

Run the same test commands again
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/operator-shell-summary.tsx src/components/operator-shell-summary.test.tsx src/app/page.test.tsx
git commit -m "feat: surface shell coverage stats"
```

### Task 6: Wire Import and Verify End-to-End

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/package.json`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/runbooks/source-refresh.md`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/runbooks/operator-shell-registry.md`

**Step 1: Write the failing test**

If appropriate, add one smoke test for command wiring; otherwise rely on command verification and document expected output.

**Step 2: Run command to verify current failure or absence**

Run: `pnpm operator-shells:import`
Expected: command missing or incomplete

**Step 3: Write minimal implementation**

- Add package script
- Document shell import workflow
- Document how shell coverage and tariff publication differ

**Step 4: Run verification**

Run:
- `pnpm operator-shells:import`
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

Expected: all pass, shell import reports inserted/updated rows

**Step 5: Commit**

```bash
git add package.json docs/runbooks/source-refresh.md docs/runbooks/operator-shell-registry.md
git commit -m "docs: add operator shell registry workflow"
```

### Task 7: Deploy and Validate on the LXC

**Files:**
- Reuse existing release process

**Step 1: Apply migration**

Run remotely:

```bash
pnpm db:migrate
```

Expected: shell schema migration applied

**Step 2: Import shell registry**

Run remotely:

```bash
pnpm operator-shells:import
```

Expected: rows imported without duplicates

**Step 3: Verify app and API**

Run:

```bash
curl -fsS http://192.168.3.178:3000/api/operators/shells
curl -fsS http://192.168.3.178:3000 | rg 'öffentlich|erfasst|Quellen gefunden'
```

Expected: shell counts visible, public tariff data unchanged

**Step 4: Commit deployment-related fixes if needed**

```bash
git add .
git commit -m "fix: complete operator shell deployment"
```

Plan complete and saved to `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/plans/2026-03-09-operator-shell-registry.md`. Two execution options:

1. Subagent-Driven (this session) - I dispatch fresh subagent per task, review between tasks, fast iteration
2. Parallel Session (separate) - Open new session with executing-plans, batch execution with checkpoints
