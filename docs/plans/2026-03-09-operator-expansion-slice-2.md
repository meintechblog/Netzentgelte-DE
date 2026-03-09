# Operator Expansion Slice 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the curated `§14a Modul 3` registry with the next verifiable operator slice from official 2026 sources: `LEW Verteilnetz`, `E.DIS Netz` and `Mainzer Netze`.

**Architecture:** Keep the existing curated-seed approach. Add only operators whose 2026 operator PDFs are directly reachable from official domains and whose Modul-3 tariff bands and time windows are legible from the source. Reuse the existing published-operator pipeline so UI, API and import flows expand automatically when the seed grows.

**Tech Stack:** TypeScript, Next.js App Router, Vitest, curated JSON registry, existing source discovery JSON, Postgres import pipeline

---

### Task 1: Lock the next operator expectations in tests

**Files:**
- Modify: `src/modules/operators/registry.test.ts`
- Modify: `src/modules/operators/current-catalog.test.ts`
- Modify: `src/modules/operators/registry-import.test.ts`
- Modify: `src/app/api/tariffs/current/route.test.ts`
- Modify: `src/app/api/operators/route.test.ts`

**Step 1: Write the failing tests**

- Assert the curated registry includes:
  - `lew-verteilnetz`
  - `e-dis-netz`
  - `mainzer-netze`
- Assert at least one characteristic time window per operator:
  - `LEW`: `17:00-21:00`
  - `E.DIS`: `16:45-20:15`
  - `Mainzer Netze`: `16:45-20:00`
- Assert import/API counts expand from `10/10/30` to `13/13/39`.
- Assert the abstract map still places nodes when more than `10` operators exist.

**Step 2: Run tests to verify they fail**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/current-catalog.test.ts src/modules/operators/registry-import.test.ts src/app/api/tariffs/current/route.test.ts src/app/api/operators/route.test.ts src/components/operator-map.test.tsx
```

Expected: FAIL because those operators do not exist in the current seed.

### Task 2: Add the official sources and tariff windows

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `data/source-registry/discovery-sources.json`

**Step 1: Implement the minimal curated data**

- Add the official 2026 operator records with source URLs, PDF URLs, review status, notes and `timeWindows`.
- Use honest review status:
  - `verified` for final 2026 PDFs
  - `pending` only if the operator marks the source as preliminary
- Update the abstract map so nodes beyond index `10` still get explicit placement.

**Step 2: Run the focused tests**

Run:

```bash
pnpm vitest run src/modules/operators/registry.test.ts src/modules/operators/current-catalog.test.ts src/modules/operators/registry-import.test.ts src/app/api/tariffs/current/route.test.ts src/app/api/operators/route.test.ts src/components/operator-map.test.tsx
```

Expected: PASS

### Task 3: Full verification and deployment

**Files:**
- No planned code changes

**Step 1: Run full local verification**

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

**Step 2: Deploy to the LXC and import**

- Follow `docs/runbooks/lxc-release.md`
- Run `pnpm registry:import` in the release directory on the LXC

**Step 3: Run live checks**

```bash
curl -fsS http://192.168.3.178:3000 | rg 'LEW Verteilnetz|E.DIS Netz|Mainzer Netze'
curl -fsS http://192.168.3.178:3000/api/tariffs/current | rg 'lew-verteilnetz|e-dis-netz|mainzer-netze|17:00-21:00|16:45-20:15|16:45-20:00'
```

Expected: New operators and time-window data visible in UI and API.
