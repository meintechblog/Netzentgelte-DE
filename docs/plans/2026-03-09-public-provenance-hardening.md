# Public Provenance Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure the public operator table only shows source-review data for the exact tariff source and only renders endcustomer products when a verified, complete current product set exists.

**Architecture:** Move row enrichment into the tariff view-model layer. Match source metadata by `sourceSlug`, then build an endcustomer display only from the newest complete verified product set for a single `validFrom`.

**Tech Stack:** Next.js, React, TypeScript, Vitest

---

### Task 1: Add failing provenance and gating tests

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.test.tsx`

**Step 1: Write the failing tests**

Add tests for:
- source metadata merges by exact `sourceSlug`
- incomplete or unverified endcustomer sets do not render
- source-details expand shows snapshot/hash data

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/components/tariff-table.test.tsx`

Expected: FAIL because current code merges sources by operator and allows partial endcustomer rendering.

### Task 2: Implement exact source merge and strict endcustomer selection

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.tsx`

**Step 1: Write minimal implementation**

Introduce helpers that:
- enrich rows from `CurrentSource[]` by exact `sourceSlug`
- select the newest complete verified endcustomer product set only

**Step 2: Run targeted tests**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/components/tariff-table.test.tsx`

Expected: PASS

### Task 3: Verify full page behavior

**Files:**
- Verify existing tests

**Step 1: Run verification**

Run:
- `pnpm test src/components/operator-explorer.test.tsx src/components/tariff-table.test.tsx src/app/page.test.tsx src/lib/view-models/tariffs.test.ts src/app/api/tariffs/endcustomer/current/route.test.ts`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

**Step 2: Commit**

```bash
git add docs/plans/2026-03-09-public-provenance-hardening-design.md docs/plans/2026-03-09-public-provenance-hardening.md src/lib/view-models/tariffs.ts src/lib/view-models/tariffs.test.ts src/components/tariff-table.test.tsx src/app/page.tsx
git commit -m "fix: harden public tariff provenance"
```
