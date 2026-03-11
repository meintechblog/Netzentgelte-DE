# Time Window Backfill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Backfill official `§14a Modul 3` time windows for the already published operators that still lack them, and render the tariff matrix as grouped schedule blocks by active period.

**Architecture:** Keep the curated JSON registry as the short-term source of truth. Add discovery-source metadata for the backfilled operators, expand their `timeWindows` from official 2026 operator PDFs, and group the existing matrix UI by `seasonLabel` so seasonality and daily ranges are obvious without leaving the table.

**Tech Stack:** TypeScript, Next.js App Router, React, Vitest, curated JSON registry, existing Postgres import and LXC release flow

---

### Task 1: Lock the missing schedule expectations in tests

**Files:**
- Modify: `src/modules/operators/registry.test.ts`
- Modify: `src/modules/operators/current-catalog.test.ts`
- Modify: `src/components/tariff-table.test.tsx`
- Modify: `src/app/page.test.tsx`

**Step 1: Write the failing tests**

- Assert time windows exist for:
  - `netze-bw`
  - `bayernwerk-netz`
  - `westnetz`
  - `wesernetz-bremen`
  - `wesernetz-bremerhaven`
- Assert the matrix renders grouped season labels and characteristic ranges like:
  - `10:00-15:00`
  - `17:00-20:00`
  - `06:00-24:00`

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/current-catalog.test.ts src/components/tariff-table.test.tsx src/app/page.test.tsx
```

Expected: FAIL because those operators currently have no structured time windows and the matrix does not yet group by season.

### Task 2: Add curated time-window and source-refresh metadata

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `data/source-registry/discovery-sources.json`

**Step 1: Implement the minimal curated data**

- Add official 2026 time windows for the five operators using the operator PDFs already linked in the seed.
- Add discovery-source entries for those operators with refresh notes and artifact expectations for later update cycles.

**Step 2: Run focused tests**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/current-catalog.test.ts
```

Expected: PASS

### Task 3: Group the matrix by active period

**Files:**
- Modify: `src/components/tariff-table.tsx`
- Modify: `src/app/globals.css`

**Step 1: Implement the minimal UI change**

- Group each operator’s `timeWindows` by `seasonLabel`.
- Render a small season header with the associated window cards under it.
- Preserve the current empty-state message for genuinely unstructured sources.

**Step 2: Run focused UI tests**

Run:

```bash
pnpm vitest run src/components/tariff-table.test.tsx src/app/page.test.tsx
```

Expected: PASS

### Task 4: Verify and deploy

**Files:**
- No planned code changes

**Step 1: Run full local verification**

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

**Step 2: Deploy to the LXC**

- Follow `docs/runbooks/lxc-release.md`
- Run `pnpm registry:import` on the LXC release directory

**Step 3: Run live checks**

```bash
curl -fsS http://192.168.3.178:3000 | rg 'Netze BW|Westnetz|wesernetz|Q1-Q4 2026|Januar bis Dezember 2026'
curl -fsS http://192.168.3.178:3000/api/tariffs/current | rg 'netze-bw|westnetz|wesernetz-bremen|10:00-15:00|17:00-20:00|06:00-24:00'
```

Expected: Backfilled operators expose their schedules in both UI and API.
