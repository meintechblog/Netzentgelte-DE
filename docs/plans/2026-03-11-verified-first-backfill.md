# Verified-First Backfill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the pending-heavy backfill flow with a verified-first workflow that selects one realistic operator candidate, completes full verification, and only counts success when the operator appears on the public homepage.

**Architecture:** Keep the existing public integrity gates, but move operator selection and automation success criteria upstream. Introduce a selector for verification-capable candidates, a one-operator verification workflow, and a live publish gate that checks the deployed public snapshot for the newly verified operator.

**Tech Stack:** TypeScript, Next.js, Vitest, pnpm, static snapshot export, shell deploy script

---

### Task 1: Document and codify the new operational terminology

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/docs/runbooks/operator-curation-model.md`
- Modify: `/Users/hulki/codex/netzentgelte/docs/runbooks/netzbetreiber-filling.md`
- Test: documentation review only

**Step 1: Write the terminology changes**

Document:
- `queued`
- `evidence-ready`
- `verification-ready`
- `verified-live`
- `blocked evidence lane`

**Step 2: Review the docs for contradictions**

Run: `rg -n "pending|source-found|verified-live|verification-ready|homepage_count" docs/runbooks`
Expected: updated docs mention verified-first success and no longer describe pending as the primary success path.

**Step 3: Commit**

```bash
git add docs/runbooks/operator-curation-model.md docs/runbooks/netzbetreiber-filling.md docs/plans/2026-03-11-verified-first-backfill-design.md docs/plans/2026-03-11-verified-first-backfill.md
git commit -m "docs: define verified-first backfill workflow"
```

### Task 2: Add the selector contract with failing tests

**Files:**
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/verified-candidate-selector.ts`
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/verified-candidate-selector.test.ts`

**Step 1: Write the failing tests**

Cover:
- candidates with official page + official PDF + structured readiness sort ahead of source-only shells
- `fiktiv` documents are excluded
- blocked or ambiguous evidence is excluded from the verified lane
- already verified operators are excluded

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts`
Expected: FAIL because the selector does not exist yet.

**Step 3: Write minimal implementation**

Implement a selector that:
- consumes shell registry state
- classifies `queued`, `evidence-ready`, `verification-ready`
- returns the best single candidate plus skipped reasons

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts`
Expected: PASS.

### Task 3: Add the verified-one-operator workflow with failing tests

**Files:**
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/verified-operator-workflow.ts`
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/verified-operator-workflow.test.ts`

**Step 1: Write the failing tests**

Cover:
- workflow refuses candidates below `verification-ready`
- workflow requires complete `NT/ST/HT`
- workflow requires structured time windows and source quotes
- workflow emits a publishable payload only when all integrity prerequisites are present

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/modules/operators/verified-operator-workflow.test.ts`
Expected: FAIL because the workflow does not exist yet.

**Step 3: Write minimal implementation**

Implement a pure workflow helper that:
- accepts operator evidence and structured extraction
- validates the required fields for `reviewStatus = verified`
- returns either `verified-payload` or `blocked reason`

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/modules/operators/verified-operator-workflow.test.ts`
Expected: PASS.

### Task 4: Replace coordinator success criteria with verified-first planning

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/automation-commands.ts`
- Modify: `/Users/hulki/codex/netzentgelte/scripts/automation/backfill-koordinator.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/backfill-koordinator.test.ts`
- Modify: `/Users/hulki/codex/netzentgelte/src/modules/operators/automation-commands.test.ts`

**Step 1: Write the failing coordinator expectations**

Change tests so a successful plan is no longer `dispatch a batch`, but:
- pick one best verification candidate
- report blocked reasons when none qualify
- prefer `verified-live` growth over pending expansion

**Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/modules/operators/backfill-koordinator.test.ts src/modules/operators/automation-commands.test.ts`
Expected: FAIL with stale batch-oriented behavior.

**Step 3: Write minimal implementation**

Refactor coordinator planning to:
- call the new selector
- emit a single-operator verification intent
- keep integration/deploy commands
- stop treating pending promotion as a success condition

**Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/modules/operators/backfill-koordinator.test.ts src/modules/operators/automation-commands.test.ts`
Expected: PASS.

### Task 5: Add the live publish gate

**Files:**
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/publish-verification-gate.ts`
- Create: `/Users/hulki/codex/netzentgelte/src/modules/operators/publish-verification-gate.test.ts`
- Modify: `/Users/hulki/codex/netzentgelte/scripts/public/deploy-public-static.sh`

**Step 1: Write the failing tests**

Cover:
- gate passes only when the target slug appears in the exported public snapshot
- gate fails if the slug is only on pending and not in the main snapshot

**Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/modules/operators/publish-verification-gate.test.ts`
Expected: FAIL because the gate does not exist yet.

**Step 3: Write minimal implementation**

Implement a gate helper and wire deploy verification so it can confirm:
- exported snapshot contains the slug
- live static payload contains the slug after deploy

**Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/modules/operators/publish-verification-gate.test.ts`
Expected: PASS.

### Task 6: Move one real operator from pending to verified

**Files:**
- Modify: `/Users/hulki/codex/netzentgelte/data/source-registry/operators.seed.json`
- Modify: any directly related test fixtures or catalog tests that assert published operator presence

**Step 1: Pick the best real candidate**

Choose one operator already near `verification-ready` with:
- official 2026 PDF
- explicit `validFrom`
- extractable `NT/ST/HT`
- extractable time windows and quotes

**Step 2: Write or update the failing expectation**

Add a test that asserts this operator is present in the published operator snapshot, not only in pending.

**Step 3: Run the test to verify it fails**

Run the specific published-catalog or snapshot test.
Expected: FAIL because the operator is not yet `verified`.

**Step 4: Write minimal registry implementation**

Add the verified structured operator data conservatively:
- `reviewStatus = verified`
- explicit bands with quotes
- explicit time windows with quotes
- consistent quarter matrix

**Step 5: Run the tests to verify it passes**

Run the affected operator and snapshot tests.
Expected: PASS.

### Task 7: Run the full release gate and deploy

**Files:**
- Use existing release paths only

**Step 1: Run focused and broad verification**

Run:
- `pnpm vitest run src/modules/operators/verified-candidate-selector.test.ts src/modules/operators/verified-operator-workflow.test.ts src/modules/operators/publish-verification-gate.test.ts src/modules/operators/backfill-koordinator.test.ts src/modules/operators/automation-commands.test.ts`
- `pnpm test`
- `pnpm typecheck`

Expected: PASS.

**Step 2: Export and build**

Run:
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

Expected: PASS.

**Step 3: Deploy static public site**

Run: `bash scripts/public/deploy-public-static.sh --skip-build`
Expected: PASS.

**Step 4: Verify the homepage actually grew**

Run checks against:
- `https://kigenerated.de/netzentgelte/data/netzentgelte/snapshot.json`
- `https://kigenerated.de/netzentgelte/`

Expected:
- `operatorCount` increased by at least one
- the selected slug is present in the main public snapshot

### Task 8: Commit and push the verified-first change set

**Files:**
- All files touched by Tasks 1-7

**Step 1: Commit**

```bash
git add docs/runbooks/operator-curation-model.md docs/runbooks/netzbetreiber-filling.md docs/plans/2026-03-11-verified-first-backfill-design.md docs/plans/2026-03-11-verified-first-backfill.md src/modules/operators scripts/public data/source-registry
git commit -m "feat: switch backfill to verified-first publication"
```

**Step 2: Push**

Run: `git push`
Expected: PASS.
