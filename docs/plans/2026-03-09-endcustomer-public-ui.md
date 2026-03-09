# Endcustomer Public UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the verified low-voltage endcustomer tariff model into the public operator view without splitting the UI into separate tables.

**Architecture:** Load the DB-backed endcustomer catalog in `HomePage`, merge it into the existing published operator rows, and render a compact product layer inside the operator cell of the existing tariff table. Keep `Modul 3` time windows in the quarterly matrix and use the new product layer only for product-level values and requirements.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, existing CSS modules in `globals.css`

---

### Task 1: Write the failing UI tests

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.test.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.test.tsx`

**Step 1: Write the failing tests**

Add expectations that the public view shows:
- `Endkunden · Niederspannung`
- `Modul 1`, `Modul 2`, `Modul 3`, `Messung`
- `61,00 €/a`, `5,53 ct/kWh`, `108,70 €/a`, `9,50 €/a`, `14,75 €/a`

**Step 2: Run tests to verify they fail**

Run: `pnpm test src/components/tariff-table.test.tsx src/app/page.test.tsx`

Expected: FAIL because the current UI does not render the endcustomer product layer.

### Task 2: Merge endcustomer data into the public page model

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.ts`

**Step 1: Add the failing integration expectation if needed**

Use the page test from Task 1 as the failing integration guard.

**Step 2: Write minimal implementation**

Load `loadEndcustomerTariffCatalog()` in `HomePage`, map it by `operatorSlug`, and enrich `TariffTableRow` with optional endcustomer display data.

**Step 3: Run the targeted tests**

Run: `pnpm test src/components/tariff-table.test.tsx src/app/page.test.tsx`

Expected: Still failing until the table renders the data.

### Task 3: Render the integrated product layer

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-explorer.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`

**Step 1: Write the minimal implementation**

Render a compact `Endkunden · Niederspannung` block in the operator cell with four product cards and requirement badges. Extend search so these values are searchable.

**Step 2: Run the targeted tests**

Run: `pnpm test src/components/tariff-table.test.tsx src/app/page.test.tsx`

Expected: PASS

### Task 4: Full verification

**Files:**
- Verify only

**Step 1: Run verification**

Run:
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

**Step 2: Commit**

```bash
git add docs/plans/2026-03-09-endcustomer-public-ui-design.md docs/plans/2026-03-09-endcustomer-public-ui.md src/app/page.tsx src/app/page.test.tsx src/components/operator-explorer.tsx src/components/tariff-table.tsx src/components/tariff-table.test.tsx src/app/globals.css src/lib/view-models/tariffs.ts
git commit -m "feat: surface endcustomer tariffs in public ui"
```
