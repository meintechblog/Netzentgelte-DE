# Tariff Time Windows Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show clearly in the tariff matrix when each `§14a Modul 3` price applies, including seasonal and time-of-day windows per operator.

**Architecture:** Extend the curated operator model with explicit tariff window records, not just `NT/ST/HT` summary bands. Feed those windows through the published operator read model into a richer tariff-table UI with a compact summary and expandable or grouped time-window display. Keep the first implementation seed-compatible so existing DB-backed pages continue to work while we evolve the storage model.

**Tech Stack:** TypeScript, Next.js App Router, React, Vitest, curated JSON registry, existing Postgres-backed read model

---

### Task 1: Add explicit tariff-window data to the curated operator model

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `src/modules/operators/registry.ts`
- Modify: `src/modules/operators/registry.test.ts`

**Step 1: Write the failing test**

- Add a registry test asserting that a curated operator exposes explicit tariff windows with season/day/time labels.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts
```

Expected: FAIL because the schema does not yet define tariff windows.

**Step 3: Write minimal implementation**

- Extend the registry Zod schema with a `timeWindows` array under `currentTariff`.
- Add first real windows for operators whose official sources clearly expose seasonal/time-of-day logic.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add data/source-registry/operators.seed.json src/modules/operators/registry.ts src/modules/operators/registry.test.ts
git commit -m "feat: add curated tariff time windows"
```

### Task 2: Flow tariff windows through the published read model and API

**Files:**
- Modify: `src/modules/operators/current-catalog.ts`
- Modify: `src/modules/operators/current-catalog.test.ts`
- Modify: `src/lib/view-models/tariffs.ts`
- Modify: `src/lib/api/serializers.ts`
- Modify: `src/app/api/tariffs/current/route.test.ts`

**Step 1: Write the failing tests**

- Add a `current-catalog` test asserting that seed-backed published operators include tariff windows.
- Add an API test asserting that `/api/tariffs/current` returns structured time-window data.

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run src/modules/operators/current-catalog.test.ts src/app/api/tariffs/current/route.test.ts
```

Expected: FAIL because the published model/API do not yet expose time windows.

**Step 3: Write minimal implementation**

- Add a `timeWindows` field to the published operator shape.
- Carry the seed-backed windows through the serializer and tariff row view-model.

**Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run src/modules/operators/current-catalog.test.ts src/app/api/tariffs/current/route.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/modules/operators/current-catalog.ts src/modules/operators/current-catalog.test.ts src/lib/view-models/tariffs.ts src/lib/api/serializers.ts src/app/api/tariffs/current/route.test.ts
git commit -m "feat: expose tariff time windows in api"
```

### Task 3: Redesign the tariff matrix to show seasonal and hourly applicability clearly

**Files:**
- Modify: `src/components/tariff-table.tsx`
- Modify: `src/components/tariff-table.test.tsx`
- Modify: `src/app/page.test.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write the failing tests**

- Add a tariff-table test that expects visible season/day/time labels per operator.
- Adjust the homepage test to assert the new schedule language appears in the matrix.

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run src/components/tariff-table.test.tsx src/app/page.test.tsx
```

Expected: FAIL because the UI only shows `NT/ST/HT` summary text today.

**Step 3: Write minimal implementation**

- Keep the row compact, but render a structured schedule block under each operator’s summary.
- Group windows by season label and show weekday/time applicability in human-readable form.
- Add only the styling needed to make the schedule readable on desktop and mobile.

**Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run src/components/tariff-table.test.tsx src/app/page.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/components/tariff-table.tsx src/components/tariff-table.test.tsx src/app/page.test.tsx src/app/globals.css
git commit -m "feat: show tariff schedules in matrix"
```
