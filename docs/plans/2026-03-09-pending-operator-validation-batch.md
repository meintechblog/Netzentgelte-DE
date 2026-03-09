# Pending Operator Validation Batch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verifizierbare `pending`-Betreiber auf strukturierte, belegte `verified`-Datensaetze hochziehen und unklare Faelle bewusst `pending` lassen.

**Architecture:** Die bestehende Registry in `data/source-registry/operators.seed.json` bleibt die einzige Seed-Quelle. Pro Betreiber werden nur dann `bands`, `timeWindows` und `reviewStatus: "verified"` eingetragen, wenn die offizielle Quellseite und das Primaerdokument die Modell-3-Werte eindeutig tragen; andernfalls bleibt der Eintrag mit `summaryFallback` und `pending` bestehen.

**Tech Stack:** JSON seed data, TypeScript/Vitest, manuelle PDF-Extraktion aus offiziellen Betreiberquellen

---

### Task 1: Validation Candidates And Guardrails

**Files:**
- Modify: `src/modules/operators/registry.test.ts`

**Step 1: Write the failing test**

Add an assertion for the first validation slice that requires explicit `verified` operators with concrete `bands` and `timeWindows`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/registry.test.ts`
Expected: FAIL because the selected operators are still `pending`.

**Step 3: Write minimal implementation**

Promote only operators whose official PDF exposes exact Modell-3 data; leave all ambiguous sources unchanged.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/registry.test.ts`
Expected: PASS

### Task 2: Seed Data Promotion For Verified Operators

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `src/modules/operators/registry-import.test.ts`

**Step 1: Write the failing test**

Extend import/count coverage so the promoted operators still expand into exactly three tariff rows each and update summary counts if the tariff-row total changes.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/registry-import.test.ts`
Expected: FAIL until the seed and counts are aligned.

**Step 3: Write minimal implementation**

Replace `summaryFallback`-only entries with exact `bands`, `timeWindows`, source quotes and `reviewStatus: "verified"` for the validated slice.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/registry-import.test.ts`
Expected: PASS

### Task 3: Publishable Surface Verification

**Files:**
- Test: `src/app/api/operators/route.test.ts`
- Test: `src/app/api/tariffs/current/route.test.ts`

**Step 1: Run publishable API tests**

Run: `pnpm vitest run src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts`
Expected: PASS with newly verified operators visible and unresolved `pending` operators still withheld.

**Step 2: Adjust only if behavior changed intentionally**

If the number of publishable operators changes, update the expectations to reflect the new `verified` set and keep withheld operators hidden.

**Step 3: Run publishable API tests again**

Run: `pnpm vitest run src/app/api/operators/route.test.ts src/app/api/tariffs/current/route.test.ts`
Expected: PASS
