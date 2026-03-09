# Remove Map Legend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the hero-map legend block while keeping the map behavior and detail panel unchanged.

**Architecture:** This is a pure presentation cleanup. The change stays inside the map component and its stylesheet, with one test updated first to prove the legend is gone.

**Tech Stack:** React, Vitest, global CSS

---

### Task 1: Remove the legend with TDD

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.test.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`

**Step 1: Write the failing test**
- Change the map test so it expects the legend texts not to exist anymore.

**Step 2: Run test to verify it fails**
- Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/operator-map.test.tsx`

**Step 3: Write minimal implementation**
- Remove the legend markup and its now-unused styling.

**Step 4: Run test to verify it passes**
- Re-run the same Vitest file.

### Task 2: Run a small regression

**Files:**
- Verify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-map.test.tsx`
- Verify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-explorer.test.tsx`
- Verify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.test.tsx`

**Step 1: Run regression**
- Run: `pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/operator-map.test.tsx src/components/operator-explorer.test.tsx src/app/page.test.tsx`

**Step 2: Confirm outcome**
- Expect all tests to pass and the hero map to render without the removed legend.
