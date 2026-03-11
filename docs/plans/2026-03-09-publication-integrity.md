# Publication Integrity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish only fully verified and integrity-checked `§14a Modell 3` operator data on the public webapp and API.

**Architecture:** Add a publication-integrity layer on top of the existing published-operator read model. The loader will build operators as today, then derive an integrity report, filter to publishable operators, and expose both publishable counts and machine-readable failures for review workflows. Public routes and homepage will consume only the filtered output.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Drizzle/Postgres read models, curated registry seed

---

### Task 1: Document the integrity contract

**Files:**
- Create: `docs/plans/2026-03-09-publication-integrity-design.md`
- Create: `docs/plans/2026-03-09-publication-integrity.md`

**Step 1: Write the design**

Capture hard publish-gate rules, evidence requirements, Schwäbisch-Hall quarter special case, and failure handling.

**Step 2: Save the implementation plan**

Describe the TDD sequence and affected files.

**Step 3: Commit**

```bash
git add docs/plans/2026-03-09-publication-integrity-design.md docs/plans/2026-03-09-publication-integrity.md
git commit -m "docs: add publication integrity design"
```

### Task 2: Add failing integrity tests

**Files:**
- Modify: `src/modules/operators/current-catalog.test.ts`
- Create: `src/modules/operators/publication-integrity.test.ts`
- Modify: `src/app/page.test.tsx`
- Modify: `src/app/api/tariffs/current/route.test.ts`
- Modify: `src/app/api/operators/route.test.ts`

**Step 1: Write failing tests for integrity rules**

Cover:
- verified operator with complete evidence is publishable
- pending operator is not publishable
- missing quotes or missing time windows are not publishable
- Schwäbisch Hall quarter rule passes only for `Q1/Q2/Q4` tri-band plus `Q3` standard-only

**Step 2: Run tests to verify they fail**

```bash
pnpm test src/modules/operators/publication-integrity.test.ts src/modules/operators/current-catalog.test.ts src/app/page.test.tsx src/app/api/tariffs/current/route.test.ts src/app/api/operators/route.test.ts
```

### Task 3: Implement integrity layer

**Files:**
- Create: `src/modules/operators/publication-integrity.ts`
- Modify: `src/modules/operators/current-catalog.ts`

**Step 1: Add integrity report types**

Introduce:
- `PublicationIntegrityCheck`
- `PublicationIntegrityReport`
- `getPublicationIntegrityReport`
- `isOperatorPublishable`

**Step 2: Implement the checks**

Rules:
- verified review status
- required URLs
- 3 bands present with values and quotes
- time windows present with quotes
- quarter matrix consistency
- Schwäbisch Hall special quarter rule

**Step 3: Filter public output**

Update `loadPublishedOperators` and seed helpers so they return only `publishable` operators for public consumption.

**Step 4: Expose stats helpers**

Keep counts aligned to the filtered public set and add integrity-aware counts where useful.

### Task 4: Update page and route expectations

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/api/tariffs/current/route.ts`
- Modify: `src/app/api/operators/route.ts`
- Modify: `src/app/api/geo/operators/route.ts`
- Modify: `src/lib/api/serializers.ts` if needed

**Step 1: Keep public routes on publishable-only data**

No pending/incomplete operator should reach these routes.

**Step 2: Update homepage copy and stats**

Reflect that public data is verified-only.

**Step 3: Optionally expose integrity summary**

If a small public note is helpful, show that pending/unverified entries are intentionally withheld.

### Task 5: Verify, deploy, and live-check

**Files:**
- Use existing release tooling only

**Step 1: Run local verification**

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

**Step 2: Release to LXC**

Use `docs/runbooks/lxc-release.md`.

**Step 3: Run remote verification**

```bash
ssh root@192.168.3.178 'cd /root/netzentgelte-de-release && pnpm test && pnpm lint && pnpm build && pnpm typecheck'
```

**Step 4: Live-check public filtering**

```bash
curl -fsS http://192.168.3.178:3000/api/tariffs/current
curl -fsS http://192.168.3.178:3000/api/operators
curl -fsS http://192.168.3.178:3000
```

Confirm that only verified/publishable operators are shown.

