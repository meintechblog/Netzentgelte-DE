# Tariff History Publication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder `501` history endpoint with a real `GET /api/tariffs/history` API backed by `tariff_versions`, `source_catalog` and the latest snapshot metadata.

**Architecture:** Add a small history read model next to the current catalog read model. Reuse the existing DB joins and seed fallback pattern, then serialize grouped tariff versions with provenance and seed-backed time windows. Keep persistence unchanged in this slice so deployment risk stays low.

**Tech Stack:** TypeScript, Next.js App Router, Drizzle ORM, Postgres, Vitest

---

### Task 1: Lock the new history behavior in tests

**Files:**
- Modify: `src/app/api/tariffs/history/route.test.ts`
- Create: `src/modules/operators/history-catalog.test.ts`

**Step 1: Write the failing tests**

- Assert the route no longer returns `501`.
- Assert the route returns `items`.
- Assert filtering via `?operator=<slug>` only returns that operator.
- Assert the read model can group DB-shaped rows into historical operator entries with provenance fields.

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run src/app/api/tariffs/history/route.test.ts src/modules/operators/history-catalog.test.ts
```

Expected: FAIL because the route still returns `501` and the history read model does not exist yet.

### Task 2: Implement the history read model and serializer

**Files:**
- Create: `src/modules/operators/history-catalog.ts`
- Modify: `src/lib/api/serializers.ts`

**Step 1: Write minimal implementation**

- Build a history loader with:
  - seed fallback for tests/no DB
  - DB-backed grouped rows from `tariff_versions`
  - `source_slug`, source URLs, review status, valid date range
  - latest snapshot hash, fetched timestamp and artifact URL when available
  - seed-backed `timeWindows`

**Step 2: Run focused tests**

Run:

```bash
pnpm vitest run src/modules/operators/history-catalog.test.ts
```

Expected: PASS

### Task 3: Publish the route

**Files:**
- Modify: `src/app/api/tariffs/history/route.ts`

**Step 1: Implement the route**

- Load the history catalog.
- Support optional `operator` query param.
- Return serialized history items.

**Step 2: Run focused tests**

Run:

```bash
pnpm vitest run src/app/api/tariffs/history/route.test.ts
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
- Run `pnpm registry:import` in the release directory if needed

**Step 3: Run live checks**

```bash
curl -fsS 'http://192.168.3.178:3000/api/tariffs/history' | rg 'items|netze-bw|sourceSlug'
curl -fsS 'http://192.168.3.178:3000/api/tariffs/history?operator=netze-bw' | rg 'netze-bw|17:00-22:00'
```

Expected: The history endpoint returns real JSON rows instead of `501`.
