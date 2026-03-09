# Operator Structure Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an internal audit feed that identifies already-filled operator entries which are not yet on the structured time-window model.

**Architecture:** Build a small audit module on top of the existing published-operator seed/read models and publication integrity signals. Expose the result through a dedicated internal API so parallel backfill work can target the exact legacy-shaped operators without editing the seed entries in this slice.

**Tech Stack:** TypeScript, Vitest, Next.js route handlers, existing operator registry/current catalog modules

---

### Task 1: Add failing tests for structure-audit detection

**Files:**
- Create: `src/modules/operators/structure-audit.test.ts`
- Create: `src/app/api/operators/structure-audit/route.test.ts`

**Step 1: Write the failing test**

Cover:
- operators with bands but no `timeWindows` are flagged
- the known legacy slugs are included
- operators with structured windows are not flagged
- API returns summary counts and audit items

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/structure-audit.test.ts src/app/api/operators/structure-audit/route.test.ts`

Expected: FAIL because the audit module and route do not exist yet.

**Step 3: Write minimal implementation**

Only after the failure is confirmed.

**Step 4: Run test to verify it passes**

Run the same targeted tests until green.

**Step 5: Commit**

```bash
git add src/modules/operators/structure-audit.test.ts src/app/api/operators/structure-audit/route.test.ts
git commit -m "test: add operator structure audit coverage"
```

### Task 2: Implement the structure-audit module and route

**Files:**
- Create: `src/modules/operators/structure-audit.ts`
- Create: `src/app/api/operators/structure-audit/route.ts`
- Modify: `src/lib/api/serializers.ts`

**Step 1: Write the failing test**

Extend the tests to require:
- deterministic sorting
- explicit reason keys
- stable summary counts

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/structure-audit.test.ts src/app/api/operators/structure-audit/route.test.ts`

Expected: FAIL because the behavior is incomplete.

**Step 3: Write minimal implementation**

Implement:
- audit item builder
- summary builder
- API serialization

**Step 4: Run test to verify it passes**

Run the targeted tests again until green.

**Step 5: Commit**

```bash
git add src/modules/operators/structure-audit.ts src/app/api/operators/structure-audit/route.ts src/lib/api/serializers.ts
git commit -m "feat: expose operator structure audit"
```

### Task 3: Verify the audit slice end-to-end

**Files:**
- Modify only if verification exposes a real defect

**Step 1: Run focused checks**

Run:
- `pnpm test src/modules/operators/structure-audit.test.ts src/app/api/operators/structure-audit/route.test.ts`
- `pnpm lint`
- `pnpm typecheck`

**Step 2: Run production build**

Run: `pnpm build`

**Step 3: Fix any failures minimally**

Only touch files needed by the failing verification.

**Step 4: Re-run verification**

Repeat until green.

**Step 5: Commit**

```bash
git add .
git commit -m "test: verify operator structure audit slice"
```
