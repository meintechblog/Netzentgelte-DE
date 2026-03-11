# Operator Expansion Slice Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the curated `§14a Modul 3` registry with additional large German distribution operators, including explicit tariff time windows and honest source/review metadata.

**Architecture:** Extend the seed registry first because the live app and API already enrich DB-backed operators from curated seed metadata for `timeWindows`. Add operators only from official operator pages and official 2026 PDFs, marking provisional sources as `pending` when the operator itself labels them as provisional or "unter Vorbehalt". Keep UI and API unchanged unless the new data reveals gaps.

**Tech Stack:** TypeScript, Next.js App Router, Vitest, curated JSON registry, source discovery JSON, existing Postgres-backed published operator read model

---

### Task 1: Lock the new operator expectations in tests

**Files:**
- Modify: `src/modules/operators/registry.test.ts`
- Modify: `src/modules/operators/current-catalog.test.ts`

**Step 1: Write the failing tests**

- Assert that the curated registry now contains the next operator slice:
  - `avacon-netz`
  - `stromnetz-berlin`
  - `mvv-netze`
  - `swm-infrastruktur`
- Assert that at least `Avacon`, `Stromnetz Berlin` and `SWM Infrastruktur` expose explicit `timeWindows`.
- Assert that provisional sources are surfaced honestly for `MVV Netze`.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/current-catalog.test.ts
```

Expected: FAIL because those operators are not yet in the curated registry.

**Step 3: Write minimal implementation**

- Add only the assertions needed to pin the new slice.

**Step 4: Run test to verify it still fails for the right reason**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/current-catalog.test.ts
```

Expected: FAIL because the source data is still missing.

### Task 2: Add the researched operators and source provenance

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `data/source-registry/discovery-sources.json`

**Step 1: Implement the minimal curated data**

- Add official 2026 source records and current tariff slices for:
  - `Avacon Netz GmbH`
  - `Stromnetz Berlin GmbH`
  - `MVV Netze GmbH`
  - `SWM Infrastruktur GmbH & Co. KG`
- Include `sourcePageUrl`, `documentUrl`, `checkedAt`, `validFrom`, source notes and `timeWindows`.
- Mark `MVV Netze` as `pending` because the operator PDF is explicitly provisional.

**Step 2: Run tests to verify the new data passes**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/current-catalog.test.ts
```

Expected: PASS

### Task 3: Verify published/UI-facing behavior with the larger slice

**Files:**
- Modify: `src/app/page.test.tsx`
- Modify: `src/app/api/tariffs/current/route.test.ts`
- Modify: `src/app/api/operators/route.test.ts`

**Step 1: Write or extend failing tests**

- Assert that homepage data includes one of the new operators.
- Assert that `/api/tariffs/current` returns one of the new operator `timeWindows`.
- Assert that `/api/operators` reflects the larger operator count.

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run src/app/page.test.tsx src/app/api/tariffs/current/route.test.ts src/app/api/operators/route.test.ts
```

Expected: FAIL before the seed changes are wired through.

**Step 3: Keep implementation minimal**

- Rely on the existing registry and serializer pipeline unless a gap appears.

**Step 4: Run tests to verify they pass**

Run:

```bash
pnpm vitest run src/app/page.test.tsx src/app/api/tariffs/current/route.test.ts src/app/api/operators/route.test.ts
```

Expected: PASS

### Task 4: Full verification and deployment

**Files:**
- No planned code changes

**Step 1: Run full local verification**

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

**Step 2: Deploy to the LXC using the documented release flow**

- Follow `docs/runbooks/lxc-release.md`

**Step 3: Run live checks**

```bash
curl -fsS http://192.168.3.178:3000 | rg 'Stromnetz Berlin|SWM Infrastruktur|Zeitfenster'
curl -fsS http://192.168.3.178:3000/api/tariffs/current | rg 'stromnetz-berlin|timeWindows|17:15-20:15'
```

Expected: New operators and time-window data visible live.
