# Modul-3 Compliance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a generic, source-backed compliance rules layer for Modul 3 so users can filter operators by rule adherence and inspect concrete rule violations per operator.

**Architecture:** Store the BDEW Modul-3 rule set as structured project data, evaluate published operator tariffs against that rule set in a dedicated compliance module, then thread the resulting findings through the existing catalog, serializer, view-model, and UI filter path.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, React Testing Library, JSON-backed source data

---

### Task 1: Add the structured rule set source

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/data/compliance/modul-3-rules.json`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/compliance/rule-catalog.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/compliance/rule-catalog.test.ts`

**Step 1: Write the failing test**

Add a test that expects the BDEW Modul-3 rule set to load with:
- PDF source URL
- five rules
- stable rule IDs for HT minimum duration, HT cap, NT corridor, two-quarter minimum, and cross-quarter consistency

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules exec vitest run src/modules/compliance/rule-catalog.test.ts`

Expected: FAIL because the catalog module and source file do not exist yet.

**Step 3: Write minimal implementation**

Add the JSON rule source and a small loader module with typed exports.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules add data/compliance/modul-3-rules.json src/modules/compliance/rule-catalog.ts src/modules/compliance/rule-catalog.test.ts
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules commit -m "feat: add modul-3 compliance rule catalog"
```

### Task 2: Add the generic compliance evaluator

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/compliance/modul-3-evaluator.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/compliance/modul-3-evaluator.test.ts`
- Reference: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/operators/quarterly-tariffs.ts`
- Reference: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/operators/current-catalog.ts`

**Step 1: Write the failing test**

Add focused tests for:
- compliant operator data
- HT window shorter than 2h
- NT value outside 10-40 percent of ST
- fewer than two active quarters
- quarter windows differing between active quarters
- missing prerequisites yielding `not-evaluable`

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules exec vitest run src/modules/compliance/modul-3-evaluator.test.ts`

Expected: FAIL because the evaluator does not exist yet.

**Step 3: Write minimal implementation**

Implement the evaluator with one generic dispatcher over `checkType`, returning a normalized evaluation payload per operator.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules add src/modules/compliance/modul-3-evaluator.ts src/modules/compliance/modul-3-evaluator.test.ts
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules commit -m "feat: evaluate modul-3 compliance findings"
```

### Task 3: Thread compliance through the published operator model and APIs

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/operators/current-catalog.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/lib/api/serializers.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/app/api/operators/route.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/app/api/tariffs/current/route.test.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/modules/operators/current-catalog.test.ts`

**Step 1: Write the failing test**

Extend published operator tests to expect a compliance payload on each operator and in tariff API rows.

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules exec vitest run src/modules/operators/current-catalog.test.ts src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts`

Expected: FAIL because the published payload has no compliance fields yet.

**Step 3: Write minimal implementation**

Compute compliance during snapshot assembly and expose it through serializers.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules add src/modules/operators/current-catalog.ts src/lib/api/serializers.ts src/modules/operators/current-catalog.test.ts src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules commit -m "feat: publish operator compliance metadata"
```

### Task 4: Add compliance data to the tariff view-model and search index

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/lib/view-models/tariffs.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/components/operator-explorer.tsx`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/lib/view-models/tariffs.test.ts`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/components/operator-explorer.test.tsx`

**Step 1: Write the failing test**

Add tests that expect:
- rule text and compliance status in the search index
- a separate compliance filter state alongside free-text search
- rows to carry structured compliance metadata

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules exec vitest run src/lib/view-models/tariffs.test.ts src/components/operator-explorer.test.tsx`

Expected: FAIL because the view-model and filter state do not include compliance yet.

**Step 3: Write minimal implementation**

Add the new fields to the row model and extend the explorer with a compliance filter control that composes with the existing page-wide search.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules add src/lib/view-models/tariffs.ts src/lib/view-models/tariffs.test.ts src/components/operator-explorer.tsx src/components/operator-explorer.test.tsx
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules commit -m "feat: add compliance filtering to operator explorer"
```

### Task 5: Render the source-backed rule set and findings in the UI

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/components/tariff-table.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/app/page.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/app/globals.css`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/components/tariff-table.test.tsx`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/src/app/page.test.tsx`

**Step 1: Write the failing test**

Add tests that expect:
- a structured BDEW rules block with PDF link
- operator-level compliance badges
- visible violation messages for non-compliant operators
- filterable compliance states in the page UI

**Step 2: Run test to verify it fails**

Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules exec vitest run src/components/tariff-table.test.tsx src/app/page.test.tsx`

Expected: FAIL because the UI does not render compliance yet.

**Step 3: Write minimal implementation**

Render the rule source and operator findings with compact, readable UI that fits the existing operator table.

**Step 4: Run test to verify it passes**

Run the same command and confirm PASS.

**Step 5: Commit**

```bash
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules add src/components/tariff-table.tsx src/components/tariff-table.test.tsx src/app/page.tsx src/app/page.test.tsx src/app/globals.css
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules commit -m "feat: surface modul-3 compliance in the app"
```

### Task 6: Verify, document, and prepare release

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/docs/runbooks/netzbetreiber-filling.md`
- Optional: `/Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules/docs/plans/2026-03-10-modul-3-compliance-design.md`

**Step 1: Run focused verification**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules exec vitest run src/modules/compliance/*.test.ts src/modules/operators/current-catalog.test.ts src/lib/view-models/tariffs.test.ts src/components/operator-explorer.test.tsx src/components/tariff-table.test.tsx src/app/page.test.tsx src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules lint
```

Expected: all green.

**Step 2: Update runbook if needed**

Document how new rule sets are added or revised.

**Step 3: Commit**

```bash
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules add docs/runbooks/netzbetreiber-filling.md
git -C /Users/hulki/projects/netzentgelte-de/.worktrees/compliance-rules commit -m "docs: add modul-3 compliance maintenance guidance"
```
