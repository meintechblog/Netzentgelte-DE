# Public Pending Operators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a public pending-operators surface and extend the Backfill Koordinator so automated runs make newly discovered operators visible on the live system before later promotion to the verified list.

**Architecture:** Build a filtered public-pending read model from the existing shell registry, expose it through a new API route and a small public page, then teach the coordinator and briefing logic to prioritize promotable pending operators before new discovery batches. Keep the existing verified-only publication path unchanged.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, existing operator registry/shell modules, Codex automation prompt/runbooks.

---

### Task 1: Add failing tests for the public pending read model

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/pending-catalog.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/shell-catalog.ts`
- Reference: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/current-catalog.ts`
- Reference: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/operator-exclusions.ts`

**Step 1: Write the failing tests**

Cover at least these cases:
- includes pending shell entries with meaningful discovery state
- excludes transmission operators
- excludes deprecated operators
- excludes operators that are already publishable in the verified registry
- returns stable summary counts for the public pending subset

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/modules/operators/pending-catalog.test.ts
```

Expected: FAIL because the public pending loader does not exist yet.

**Step 3: Write minimal implementation**

Create a dedicated public-pending read model module instead of overloading the full shell catalog. Keep the public shape intentionally small and derive it from existing shell registry data.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/modules/operators/pending-catalog.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/operators/pending-catalog.test.ts src/modules/operators/pending-catalog.ts
 git commit -m "feat: add public pending operator catalog"
```

### Task 2: Add the pending operators API route

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/src/app/api/operators/pending/route.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/src/app/api/operators/pending/route.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/lib/api/serializers.ts`
- Reference: `/Users/hulki/projects/netzentgelte-de/src/app/api/operators/route.ts`
- Reference: `/Users/hulki/projects/netzentgelte-de/src/app/api/operators/shells/route.ts`

**Step 1: Write the failing route test**

Assert that `/api/operators/pending` returns:
- a filtered `items` list
- a `summary` object
- no tariff matrix fields such as `bands` or `timeWindows`

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/app/api/operators/pending/route.test.ts
```

Expected: FAIL because the route and serializer are missing.

**Step 3: Write minimal implementation**

Load the public pending catalog, serialize only the minimal public fields, and keep the existing `/api/operators` and `/api/operators/shells` behavior unchanged.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/app/api/operators/pending/route.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/api/operators/pending/route.ts src/app/api/operators/pending/route.test.ts src/lib/api/serializers.ts
 git commit -m "feat: expose public pending operators api"
```

### Task 3: Add the public pending page

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/src/app/netzbetreiber/in-pruefung/page.tsx`
- Create: `/Users/hulki/projects/netzentgelte-de/src/app/netzbetreiber/in-pruefung/page.test.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/app/page.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/app/globals.css`
- Reference: `/Users/hulki/projects/netzentgelte-de/src/components/operator-explorer.tsx`

**Step 1: Write the failing page tests**

Assert:
- the page renders a clear heading such as `Netzbetreiber in Pruefung`
- it explains that tariff details are withheld until verification
- it renders minimal status rows/cards from the pending dataset
- a publishable operator does not appear on the pending page

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/app/netzbetreiber/in-pruefung/page.test.tsx
```

Expected: FAIL because the page does not exist yet.

**Step 3: Write minimal implementation**

Build a small, explicit page. Do not reuse the tariff table. Add a simple public entry point from the main page if needed, but keep the verified-first public experience dominant.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/app/netzbetreiber/in-pruefung/page.test.tsx src/app/page.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/netzbetreiber/in-pruefung/page.tsx src/app/netzbetreiber/in-pruefung/page.test.tsx src/app/page.tsx src/app/globals.css
 git commit -m "feat: add public pending operators page"
```

### Task 4: Extend the public snapshot/export path

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/public-snapshot/build-public-snapshot.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/public-snapshot/build-public-snapshot.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/public-snapshot/schema.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/public-snapshot/export-public-snapshot.test.ts`

**Step 1: Write the failing snapshot tests**

Assert that the public snapshot can include a dedicated pending section with counts and minimal rows, while keeping the verified operator snapshot untouched.

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/modules/public-snapshot/build-public-snapshot.test.ts src/modules/public-snapshot/export-public-snapshot.test.ts
```

Expected: FAIL because the pending section is not modeled yet.

**Step 3: Write minimal implementation**

Extend the public snapshot schema with a separate `pendingOperators` section. Do not co-mingle verified and pending operators in one array.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/modules/public-snapshot/build-public-snapshot.test.ts src/modules/public-snapshot/export-public-snapshot.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/public-snapshot/build-public-snapshot.ts src/modules/public-snapshot/build-public-snapshot.test.ts src/modules/public-snapshot/schema.ts src/modules/public-snapshot/export-public-snapshot.test.ts
 git commit -m "feat: include pending operators in public snapshot"
```

### Task 5: Teach briefing and batching to prioritize promotions

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/shell-batches.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/shell-batches.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/backfill-briefing.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/backfill-briefing.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/app/api/operators/backfill-briefing/route.ts`

**Step 1: Write the failing prioritization tests**

Assert:
- promotable pending operators are batched before new discovery work
- bestandskorrektur still remains eligible work
- batch briefing text explicitly distinguishes `promotion` vs `discovery`

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/modules/operators/shell-batches.test.ts src/modules/operators/backfill-briefing.test.ts
```

Expected: FAIL because prioritization is not encoded yet.

**Step 3: Write minimal implementation**

Add a deterministic priority layer for `promotion-first` without breaking existing batch determinism.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/modules/operators/shell-batches.test.ts src/modules/operators/backfill-briefing.test.ts src/app/api/operators/backfill-briefing/route.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/operators/shell-batches.ts src/modules/operators/shell-batches.test.ts src/modules/operators/backfill-briefing.ts src/modules/operators/backfill-briefing.test.ts src/app/api/operators/backfill-briefing/route.ts
 git commit -m "feat: prioritize promotable pending operator batches"
```

### Task 6: Update the automation contract and runbooks

**Files:**
- Modify: `/Users/hulki/.codex/automations/backfill-koordinator/automation.toml`
- Modify: `/Users/hulki/projects/netzentgelte-de/docs/runbooks/operator-curation-model.md`
- Modify: `/Users/hulki/projects/netzentgelte-de/docs/runbooks/lxc-release.md`
- Optional: `/Users/hulki/projects/netzentgelte-de/docs/runbooks/netzbetreiber-filling.md`

**Step 1: Write the failing documentation/contract checklist**

Create a brief checklist in the commit message or working notes covering:
- coordinator now publishes pending operators publicly
- coordinator prioritizes promotion before discovery
- deploy verification includes the new pending API/page on dev and Hetzner

**Step 2: Verify current docs are missing these behaviors**

Use `rg` to confirm the gap before editing.

**Step 3: Write minimal implementation**

Update the automation prompt and runbooks so the documented operating contract matches the new product behavior.

**Step 4: Verify the docs now reflect the contract**

Run:

```bash
rg -n "pending|in-pruefung|promotion|/api/operators/pending" /Users/hulki/projects/netzentgelte-de/docs /Users/hulki/.codex/automations/backfill-koordinator/automation.toml
```

Expected: the new public pending and promotion-first rules are documented.

**Step 5: Commit**

```bash
git add /Users/hulki/.codex/automations/backfill-koordinator/automation.toml /Users/hulki/projects/netzentgelte-de/docs/runbooks/operator-curation-model.md /Users/hulki/projects/netzentgelte-de/docs/runbooks/lxc-release.md
 git commit -m "docs: align coordinator contract with pending public workflow"
```

### Task 7: Add end-to-end verification coverage

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/src/app/api/operators/route.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/app/page.test.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/current-catalog.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/shell-catalog.test.ts`
- Create or modify: `/Users/hulki/projects/netzentgelte-de/src/modules/operators/pending-public-integrity.test.ts`

**Step 1: Write the failing integration tests**

Assert:
- a verified operator appears only in the verified surface
- a pending public operator appears only in the pending surface
- counts remain coherent across verified, pending and withheld sets

**Step 2: Run test to verify it fails**

Run:

```bash
pnpm test src/modules/operators/pending-public-integrity.test.ts src/app/api/operators/route.test.ts src/app/page.test.tsx
```

Expected: FAIL because cross-surface integrity is not fully enforced yet.

**Step 3: Write minimal implementation**

Adjust shared helpers or filtering so surface separation is guaranteed in one place, not only by page-level coincidence.

**Step 4: Run test to verify it passes**

Run:

```bash
pnpm test src/modules/operators/pending-public-integrity.test.ts src/app/api/operators/route.test.ts src/app/api/operators/pending/route.test.ts src/app/netzbetreiber/in-pruefung/page.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/modules/operators/pending-public-integrity.test.ts src/app/api/operators/route.test.ts src/app/page.test.tsx src/modules/operators/current-catalog.test.ts src/modules/operators/shell-catalog.test.ts
 git commit -m "test: enforce verified and pending public separation"
```

### Task 8: Run full verification and rollout checks

**Files:**
- No code changes required unless fixes are needed.

**Step 1: Run focused tests first**

Run:

```bash
pnpm test src/modules/operators/pending-catalog.test.ts src/app/api/operators/pending/route.test.ts src/app/netzbetreiber/in-pruefung/page.test.tsx src/modules/operators/shell-batches.test.ts src/modules/operators/backfill-briefing.test.ts src/modules/public-snapshot/build-public-snapshot.test.ts
```

Expected: PASS.

**Step 2: Run the full project gate**

Run:

```bash
pnpm test && pnpm typecheck && pnpm exec eslint src scripts && NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public && NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build
```

Expected: PASS.

**Step 3: Run live verification after deploy**

Run:

```bash
curl -fsS http://192.168.3.178:3000/api/operators | jq '{count:(.items|length)}'
curl -fsS http://192.168.3.178:3000/api/operators/pending | jq '{count:(.items|length)}'
curl -fsS https://kigenerated.de/netzentgelte/data/netzentgelte/meta.json | jq '{operatorCount}'
curl -fsS https://kigenerated.de/netzentgelte/api/operators/pending.json | jq '{count:(.items|length)}'
```

Expected: verified and pending surfaces both respond, with no duplicate public operator semantics.

**Step 4: Commit any final fixes**

If verification requires adjustments, make the smallest fix and commit it before rollout.

**Step 5: Finish**

Only after all commands are green should the rollout proceed to push, LXC sync, import sync, and Hetzner public deploy.
