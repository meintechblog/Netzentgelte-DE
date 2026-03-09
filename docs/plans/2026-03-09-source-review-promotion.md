# Source Review Promotion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the curated Avacon and MVV source entries with the latest official 2026 publication state without overstating provenance certainty.

**Architecture:** Keep the existing seed-backed registry model and update only the provenance layer. The change is intentionally narrow: tests define the new review status and source URLs, then the seed/discovery files are brought into alignment.

**Tech Stack:** Next.js, TypeScript, Vitest, JSON seed registry

---

### Task 1: Lock the new source expectations in tests

**Files:**
- Modify: `src/modules/operators/registry.test.ts`

**Step 1: Write the failing test**

Assert that `mvv-netze` exposes `reviewStatus: "verified"` with the final 18.12.2025 PDF, while `avacon-netz` stays `pending` until page-level finality evidence is stored alongside the PDF.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/registry.test.ts`
Expected: FAIL because the current seed still marks both operators as `pending`.

### Task 2: Update the curated registry and discovery notes

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `data/source-registry/discovery-sources.json`

**Step 1: Update Avacon**

Keep the official operator page and 2026 PDF, but leave review status at `pending`. Rewrite notes to explain that the page publishes final 2026 net charges while the currently stored PDF still carries the reservation logic and therefore cannot, on its own, justify `verified`.

**Step 2: Update MVV**

Switch from the preliminary PDF to the final 18.12.2025 PDF, promote review status to `verified`, and capture that the final page states the new publication matches the earlier provisional amount.

**Step 3: Run targeted test**

Run: `pnpm vitest run src/modules/operators/registry.test.ts`
Expected: PASS

### Task 3: Verify and prepare rollout

**Files:**
- No new source files

**Step 1: Run the full verification sequence**

Run:
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

Expected: all commands exit `0`

**Step 2: Deploy and refresh remote DB-backed seed import**

Run the established release flow, then `pnpm registry:import` on the LXC and verify the live app/API reflect the new review counts and source URLs.
