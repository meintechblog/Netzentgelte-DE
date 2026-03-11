# Endkunden-Tarifmodell Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a DB-backed end-customer tariff model for low-voltage `§14a` products that can represent Modul 1, 2 and 3, including base prices, work prices, reductions, requirements and quarterly time windows.

**Architecture:** Keep the existing `tariff_versions` table for historical price rows, but add a separate product model with four new tables: product headers, monetary components, requirements and time windows. The first slice avoids dirty registry files by implementing schema plus a tested Schwäbisch-Hall reference fixture instead of mass backfilling live operator seeds.

**Tech Stack:** Next.js, TypeScript, Vitest, Drizzle ORM, PostgreSQL

---

### Task 1: Add failing schema tests for the new product model

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/db/schema/endcustomer-tariffs.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/db/schema/schema.test.ts`

**Step 1: Write the failing test**

- Assert the new tables exist:
  - `tariff_products`
  - `tariff_components`
  - `tariff_requirements`
  - `tariff_time_windows`
- Assert key fields exist:
  - `moduleKey`
  - `networkLevel`
  - `componentKey`
  - `requirementKey`
  - `quarterKey`
  - `bandKey`

**Step 2: Run test to verify it fails**

Run: `pnpm test src/db/schema/endcustomer-tariffs.test.ts src/db/schema/schema.test.ts`

Expected: FAIL because the new schema file and exports do not exist yet.

**Step 3: Write minimal implementation**

- Create a new schema file that defines the four tables.
- Wire the tables into `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/db/schema/index.ts`.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/db/schema/endcustomer-tariffs.test.ts src/db/schema/schema.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/db/schema/endcustomer-tariffs.test.ts src/db/schema/schema.test.ts src/db/schema/endcustomer-tariffs.ts src/db/schema/index.ts
git commit -m "feat: add endcustomer tariff schema"
```

### Task 2: Add the SQL migration for the new tables

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/drizzle/0007_endcustomer_tariff_products.sql`

**Step 1: Write the failing migration expectation**

- Reuse the schema tests from Task 1 as the failure signal.
- Confirm the new tables are not yet materializable on a fresh DB snapshot.

**Step 2: Run test or schema check to verify the gap**

Run: `pnpm test src/db/schema/endcustomer-tariffs.test.ts`

Expected: schema exists in code, but migration file is still missing from the Drizzle directory.

**Step 3: Write minimal implementation**

- Add SQL for:
  - `tariff_products`
  - `tariff_components`
  - `tariff_requirements`
  - `tariff_time_windows`
- Reference existing `operators`, `source_catalog` and `source_snapshots` where appropriate.

**Step 4: Run verification**

Run: `pnpm lint && pnpm build && pnpm typecheck`

Expected: PASS

**Step 5: Commit**

```bash
git add drizzle/0007_endcustomer_tariff_products.sql
git commit -m "feat: add endcustomer tariff migration"
```

### Task 3: Add a tested Schwäbisch-Hall reference fixture

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-reference.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-reference.test.ts`

**Step 1: Write the failing test**

- Assert the reference fixture exports a low-voltage product set for `stadtwerke-schwaebisch-hall`
- Assert:
  - Modul 1 base price `61.00`
  - Modul 1 work price `5.53`
  - Modul 1 reduction `108.70`
  - Modul 2 base price `0.00`
  - Modul 2 work price `2.21`
  - Modul 3 prices `5.53`, `8.14`, `1.11`
  - Q3 contains only standard tariff `00:00-24:00`
  - metering prices `9.50` and `14.75`

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/tariffs/endcustomer-reference.test.ts`

Expected: FAIL because the module does not exist yet.

**Step 3: Write minimal implementation**

- Add plain TypeScript types for products, components, requirements and windows.
- Encode the Schwäbisch-Hall reference fixture from the PDF as source-of-truth test data.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/tariffs/endcustomer-reference.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/tariffs/endcustomer-reference.ts src/modules/tariffs/endcustomer-reference.test.ts
git commit -m "feat: add stadtwerke hall endcustomer reference fixture"
```

### Task 4: Run full local verification

**Files:**
- No new files

**Step 1: Run focused tests**

Run:

```bash
pnpm test src/db/schema/endcustomer-tariffs.test.ts src/db/schema/schema.test.ts src/modules/tariffs/endcustomer-reference.test.ts
```

Expected: PASS

**Step 2: Run project verification**

Run:

```bash
pnpm lint
pnpm build
pnpm typecheck
```

Expected: PASS

**Step 3: Commit verification-safe slice**

```bash
git status --short
```

Expected: only the new slice files plus any unrelated pre-existing dirty files from parallel work.

### Task 5: Deploy safely to the LXC

**Files:**
- No new files

**Step 1: Build isolated release artifact**

- Use `git archive HEAD` into a temp stage directory.
- Overlay only files required for a green release if the working tree contains unrelated dirty files.

**Step 2: Verify in release dir**

Run on `root@192.168.3.178`:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm typecheck
```

Expected: PASS

**Step 3: Switch live app and verify**

Check:

```bash
curl -fsS http://192.168.3.178:3000/api/operators/backfill-briefing
ssh root@192.168.3.178 'pid=$(ss -ltnp | sed -n "s/.*:3000 .*pid=\\([0-9]\\+\\).*/\\1/p" | head -n 1); readlink /proc/$pid/cwd'
```

Expected:
- API responds
- process cwd is `/root/netzentgelte-de`

### Task 6: Prepare the next migration slice

**Files:**
- Update: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/plans/2026-03-09-endcustomer-tariff-model-design.md`

**Step 1: Record next phase explicitly**

- Note that the next slice should:
  - persist real operator data into the new tables
  - wire public/internal APIs to the new product model
  - expose `Modul 1/2/3` side-by-side in the UI

**Step 2: Commit**

```bash
git add docs/plans/2026-03-09-endcustomer-tariff-model-design.md docs/plans/2026-03-09-endcustomer-tariff-model.md
git commit -m "docs: add endcustomer tariff model plan"
```
