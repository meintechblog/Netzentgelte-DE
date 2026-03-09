# Quarterly Tariff Matrix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the tall tariff-window cards with a compact quarter-based tariff matrix that uses Stadtwerke Schwäbisch Hall as the primary correctness reference.

**Architecture:** Keep the persisted operator schema unchanged and add a UI read-model that expands seasonal time windows into `Q1` to `Q4`. Render the result in a denser matrix layout inside the tariff table so each operator shows quarter-specific tariff groups with prices and times.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library

---

### Task 1: Add quarter-based tariff view-model tests

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.test.ts`

**Step 1: Write failing tests**

- Add a test that expands `Q1 und Q4`, `Q2-Q3` and `Ganzjährig` labels into quarter buckets.
- Add a Schwäbisch-Hall regression asserting:
  - `Q1`, `Q2`, `Q4` contain `ST`, `HT`, `NT`
  - `Q3` contains only `ST 00:00-24:00`

**Step 2: Run the targeted tests and confirm failure**

Run: `pnpm test src/lib/view-models/tariffs.test.ts`

**Step 3: Implement the minimal quarter-expansion logic**

- Add quarter cell types and mapping helpers.
- Expand windows by quarter and attach the matching band price per tariff group.

**Step 4: Re-run targeted tests**

Run: `pnpm test src/lib/view-models/tariffs.test.ts`

### Task 2: Replace the tariff window UI with a quarter matrix

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.test.tsx`

**Step 1: Write the failing component test**

- Assert the tariff table renders quarter headers.
- Assert Schwäbisch Hall shows `Q3` with only `Standardtarif` and `00:00-24:00`.

**Step 2: Run the targeted component test and confirm failure**

Run: `pnpm test src/components/tariff-table.test.tsx`

**Step 3: Implement the compact quarterly matrix**

- Remove the tall grouped card list.
- Render one compact quarter grid per operator.
- Show tariff label, price and time slots in a dense source-inspired layout.

**Step 4: Re-run targeted component tests**

Run: `pnpm test src/components/tariff-table.test.tsx`

### Task 3: Refresh styling for the new matrix

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`

**Step 1: Add the matrix styles**

- Add compact quarter grid styles.
- Add band-specific visual treatment for `ST`, `HT`, `NT`.
- Ensure mobile stacking and desktop density both work.

**Step 2: Verify build and tests**

Run:
- `pnpm test src/components/tariff-table.test.tsx src/lib/view-models/tariffs.test.ts`
- `pnpm build`

### Task 4: Full verification

**Files:**
- No new files

**Step 1: Run the full verification block**

Run:
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

**Step 2: Deploy to the LXC and live-check**

- Reuse the release runbook in `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/docs/runbooks/lxc-release.md`
- Re-import registry if needed
- Verify live output for `stadtwerke-schwaebisch-hall`

