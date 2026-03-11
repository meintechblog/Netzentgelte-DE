# Endcustomer Backfill Batch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Backfill missing endcustomer tariff models for published operators, starting with AllgaeuNetz and continuing through the remaining audited gaps using only official 2026 sources.

**Architecture:** Extend the curated endcustomer reference registry with additional operator entries, reuse the existing helper builders for module requirements and time windows, and verify progress through focused reference tests and the endcustomer audit endpoint.

**Tech Stack:** Next.js, TypeScript, Vitest, official PDF sources, Poppler `pdftotext`

---

### Task 1: Research AllgaeuNetz and the next missing operators

**Files:**
- Reference: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/data/source-registry/operators.seed.json`
- Modify later: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/tariffs/endcustomer-reference.ts`

**Step 1: Gather official sources**

- Use the current operator seed and official source page/document URLs from the registry.
- Extract `Modul 1/2/3` and metering values from the official 2026 PDFs.

**Step 2: Record open questions**

- If a module or metering value is not explicit in the PDF, mark the operator as unresolved instead of inferring values.

### Task 2: Lock the first new references with tests

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/tariffs/endcustomer-reference.test.ts`

**Step 1: Write the failing tests**

- Add assertions for AllgaeuNetz and the next researched operators.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/tariffs/endcustomer-reference.test.ts`

**Step 3: Write minimal implementation**

- Add only the researched references needed to satisfy the new tests.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/modules/tariffs/endcustomer-reference.test.ts`

### Task 3: Verify audit reduction

**Files:**
- Reference: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/api/tariffs/endcustomer/audit/route.test.ts`

**Step 1: Run focused checks**

Run:
- `pnpm test src/modules/tariffs/endcustomer-reference.test.ts src/modules/tariffs/endcustomer-catalog.test.ts src/app/api/tariffs/endcustomer/audit/route.test.ts`

**Step 2: Run full verification**

Run:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

**Step 3: Deploy and verify**

- Import updated references on the LXC.
- Verify the live audit count decreases and the API exposes the new operator entries.
