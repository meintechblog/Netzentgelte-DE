# Merged Matrix And Source Details Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tarifmatrix und Quellenprüfung in einer einzigen, seitenweit gefilterten Betreiberansicht zusammenführen.

**Architecture:** Der bestehende Betreiber-Explorer bleibt die zentrale UI-Schicht. Die Suchlogik wird auf kombinierte Betreiber- und Quellendaten erweitert, der separate Quellenblock auf der Startseite entfällt, und die Tariftabelle bzw. Betreiberliste erhält pro Betreiber einen standardmäßig geschlossenen Detail-Disclosure für Quelle und Prüfstatus.

**Tech Stack:** Next.js App Router, React 19, existing operator explorer/table components, Vitest, Testing Library

---

### Task 1: Write failing integration tests for the merged page structure

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-explorer.test.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.test.tsx`

**Step 1: Write the failing test**

Add tests that verify:

- the old `Quellenprüfung` section is no longer rendered as its own page block
- the renamed main section is rendered
- source details are initially collapsed
- expanding a provider reveals compact source details

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/operator-explorer.test.tsx src/app/page.test.tsx
```

Expected: FAIL because the current UI still renders separate sections and has no inline disclosure.

### Task 2: Write failing search-behavior tests

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-explorer.test.tsx`

**Step 1: Write the failing test**

Add tests that verify the hero search filters the merged operator list by:

- operator name
- region
- source slug or source URL evidence

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/operator-explorer.test.tsx
```

Expected: FAIL because current matching is narrower and does not cover integrated source data.

### Task 3: Implement the merged operator/source UI

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/page.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-explorer.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx`
- Delete or stop using: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/source-review-table.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`

**Step 1: Write minimal implementation**

Implement:

- renamed main section heading
- removal of the standalone source-review section from the page
- per-operator disclosure row or card section for source details
- compact health/status rendering inside the disclosure
- search matching against integrated source fields

**Step 2: Run targeted tests to verify they pass**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/operator-explorer.test.tsx src/app/page.test.tsx
```

Expected: PASS

### Task 4: Refine copy and accessibility

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/operator-explorer.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/components/tariff-table.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/globals.css`

**Step 1: Improve labels and disclosure semantics**

Use clear labels such as `Quelle & Prüfstatus anzeigen` / `... ausblenden`, ensure button semantics, and keep the collapsed state screen-reader legible.

**Step 2: Run tests again**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/components/operator-explorer.test.tsx src/app/page.test.tsx src/components/tariff-table.test.tsx src/components/source-review-table.test.tsx
```

Expected: PASS

### Task 5: Full regression verification

**Files:**
- None

**Step 1: Run full relevant suite**

Run:

```bash
pnpm -C /Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap exec vitest run src/app/page.test.tsx src/components/operator-explorer.test.tsx src/components/tariff-table.test.tsx src/components/source-review-table.test.tsx src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts src/app/api/sources/current/route.test.ts
```

Expected: PASS

**Step 2: Spot-check merged UX**

Confirm:

- no separate `Quellenprüfung` page section remains
- the main section name matches the new copy
- expanding one provider reveals the correct source details
- the hero search filters the merged list consistently
