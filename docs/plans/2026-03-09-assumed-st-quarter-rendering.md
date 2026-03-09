# Assumed ST Quarter Rendering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render completely empty tariff quarters as explicitly marked `ST` assumptions when a verified standard tariff price exists, while moving time labels out of the visible quarter blocks and into hover/accessibility text.

**Architecture:** Extend the quarterly tariff model with segment and quarter provenance metadata so the UI can distinguish official windows from inferred `ST` fallback coverage. Update the tariff table to render assumed quarters with distinct styling, compact blocks, hover-only timing information, and a clearer quarter summary. Keep the change isolated to tariff view-model generation and the quarterly table UI.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, CSS

---

### Task 1: Capture the desired quarter fallback in tests

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.test.tsx`

**Step 1: Write the failing test**

- Add a view-model expectation that `mvv-netze` `Q2` and `Q3` produce one full-day `ST` segment with explicit assumption metadata.
- Add a UI expectation that the rendered quarter shows an assumption summary and no inline visible time label inside the block.

**Step 2: Run test to verify it fails**

Run:
`pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/lib/view-models/tariffs.test.ts src/components/tariff-table.test.tsx`

Expected:
- failing assertions for the new `assumed` quarter behavior

### Task 2: Extend the quarterly tariff model

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/operators/quarterly-tariffs.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.ts`

**Step 1: Write minimal implementation**

- Add provenance flags for quarter/segment state such as `official` vs `assumed-st`.
- When a quarter has zero groups and an `ST` band exists, synthesize one `00:00-24:00` assumed `ST` group and segment.
- Preserve existing official group behavior unchanged.

**Step 2: Run tests to verify the model passes**

Run:
`pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/lib/view-models/tariffs.test.ts`

Expected:
- view-model tests pass

### Task 3: Update the tariff table presentation

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`

**Step 1: Write minimal implementation**

- Remove visible time labels from segment content.
- Render assumed segments with a distinct class and tooltip/`aria-label` copy.
- Show clearer quarter summary text for assumed quarters.
- Optionally annotate the `ST` badge when the row contains assumed quarters.

**Step 2: Run tests to verify UI passes**

Run:
`pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/tariff-table.test.tsx src/app/page.test.tsx`

Expected:
- UI tests pass without regressions

### Task 4: Verify and release

**Files:**
- No additional product files expected

**Step 1: Run focused verification**

Run:
`pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/lib/view-models/tariffs.test.ts src/components/tariff-table.test.tsx src/components/operator-explorer.test.tsx src/app/page.test.tsx`

**Step 2: Run quality gates**

Run:
`pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap lint`

**Step 3: Deploy to LXC**

- Sync workspace to the LXC release target
- run the same focused `vitest` selection remotely
- run `pnpm lint`
- run `pnpm build`

**Step 4: Commit**

```bash
git add docs/plans/2026-03-09-assumed-st-quarter-rendering-design.md \
  docs/plans/2026-03-09-assumed-st-quarter-rendering.md \
  src/modules/operators/quarterly-tariffs.ts \
  src/lib/view-models/tariffs.test.ts \
  src/components/tariff-table.tsx \
  src/components/tariff-table.test.tsx \
  src/app/globals.css
git commit -m "feat: mark inferred standard tariff quarters"
```
