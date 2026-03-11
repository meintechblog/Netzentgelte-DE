# Quarter Row Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the tariff table so all four quarter cells are shown side-by-side on desktop while source metadata moves into the operator column.

**Architecture:** Keep the existing quarter-matrix data model, but flatten the table layout: each row renders four quarter columns directly instead of nesting the entire matrix in a single “Modul 3 aktuell” cell. The operator column becomes the metadata anchor for source links and audit info.

**Tech Stack:** Next.js, React, TypeScript, Vitest, CSS

---

### Task 1: Add failing layout expectations

**Files:**
- Modify: `src/components/tariff-table.test.tsx`

**Step 1: Write failing test expectations**

Assert:
- headers `Netzbetreiber`, `Q1`, `Q2`, `Q3`, `Q4`, `Review`
- no dedicated `Quelle` column header
- source links still render inside the operator cell

**Step 2: Run targeted test and confirm failure**

```bash
pnpm test src/components/tariff-table.test.tsx
```

### Task 2: Flatten the row layout

**Files:**
- Modify: `src/components/tariff-table.tsx`

**Step 1: Move source metadata into the operator block**

Render links, check timestamp and source slug below the operator identity.

**Step 2: Render one table cell per quarter**

Map `Q1-Q4` into fixed columns.

**Step 3: Keep review pill as the final column**

### Task 3: Update styling

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add layout styles for the compact operator meta block**
**Step 2: Make quarter cells consistent and narrow enough for a four-column desktop grid**
**Step 3: Preserve horizontal scrolling only for smaller screens**

### Task 4: Verify

**Files:**
- No new files

**Step 1: Run targeted tests**

```bash
pnpm test src/components/tariff-table.test.tsx
```

**Step 2: Run project verification**

```bash
pnpm test
pnpm lint
pnpm build
pnpm typecheck
```

