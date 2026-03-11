# Verified Lane Guardrails Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep contradictory or incomplete operator candidates out of the verified lane and promote the next fully evidenced operator into the main catalog.

**Architecture:** Tighten verified candidate classification with small evidence-pattern guardrails, then curate one operator end-to-end using official 2026 page/PDF evidence and the existing publication-integrity workflow.

**Tech Stack:** TypeScript, Vitest, Next.js static export, JSON registry seeds

---

### Task 1: Guardrail tests

**Files:**
- Modify: `src/modules/operators/verified-candidate-selector.test.ts`

**Step 1: Write the failing test**

Add cases for:
- audit notes like `keine publizierbare Modul-3-Jahresmatrix` blocking the verify lane
- shell-only published candidates with `tariffStatus: "missing"` staying `evidence-ready`

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts`

**Step 3: Write minimal implementation**

Extend candidate blocking/staging logic without changing unrelated orchestration code.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts`

### Task 2: Selector implementation

**Files:**
- Modify: `src/modules/operators/verified-candidate-selector.ts`

**Step 1: Write the failing test**

Covered in Task 1.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts`

**Step 3: Write minimal implementation**

Teach the selector to:
- recognize explicit non-publishability notes
- downgrade shell-only `missing` cases with only raw source links to `evidence-ready`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/backfill-koordinator.test.ts`

### Task 3: Promote next verified operator

**Files:**
- Modify: `data/source-registry/operators.seed.json`
- Modify: `data/source-registry/operator-shells.seed.json`
- Modify: affected expectation tests if counts change

**Step 1: Find strongest official 2026 candidate**

Inspect official source page and PDF for a complete, explicit Modul-3 matrix.

**Step 2: Write minimal verified data**

Add source document, structured bands, time windows, and verified status only if the source explicitly supports them.

**Step 3: Sync shell status**

Promote the corresponding shell to `reviewStatus: "verified"` and `tariffStatus: "verified"`.

**Step 4: Run focused tests**

Run: `pnpm vitest run src/modules/operators/current-catalog.test.ts src/app/api/operators/route.test.ts src/modules/operators/pending-catalog.test.ts src/modules/operators/publication-integrity.test.ts`

### Task 4: Full verification and deploy

**Files:**
- None or small expectation updates from Task 3

**Step 1: Run project gates**

Run:
- `pnpm test`
- `pnpm typecheck`
- `pnpm exec eslint src scripts`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

**Step 2: Deploy**

Run: `bash scripts/public/deploy-public-static.sh --skip-build`

**Step 3: Live-check**

Confirm homepage count increased and the new slug is present in the live snapshot.
