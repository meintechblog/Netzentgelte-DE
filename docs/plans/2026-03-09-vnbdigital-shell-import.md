# VNBdigital Shell Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the internal operator shell registry from a curated slice to a VNBdigital-backed nationwide baseline while preserving existing published/operator shell identities.

**Architecture:** Add a dedicated VNBdigital ingestion module that fetches the public operator index and detail payloads, maps them into shell candidates, then merges those candidates with the current published operator registry and the existing shell registry. Persist the merged result through the existing shell import path so the live internal API and database inherit the larger baseline without changing public publication rules.

**Tech Stack:** TypeScript, Vitest, Node fetch, Zod, existing shell import pipeline, Next.js internal API, Drizzle/Postgres

---

### Task 1: Add failing tests for VNBdigital parsing and merge invariants

**Files:**
- Create: `src/modules/operators/vnbdigital-shells.test.ts`
- Modify: `src/modules/operators/shell-registry.test.ts`

**Step 1: Write the failing test**

Add tests that:
- parse a `vnb_vnbs` response into typed list items
- parse a `vnb_vnb` detail response into a typed detail object
- reuse an existing published slug when the candidate matches the current operator name/website
- preserve shell uniqueness after merge

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/vnbdigital-shells.test.ts src/modules/operators/shell-registry.test.ts`

Expected: FAIL because the VNBdigital module and merge helpers do not exist yet.

**Step 3: Write minimal implementation**

Create minimal placeholders and helper signatures only after the failure is confirmed.

**Step 4: Run test to verify it passes**

Run the same targeted test command and keep iterating until green.

**Step 5: Commit**

```bash
git add src/modules/operators/vnbdigital-shells.test.ts src/modules/operators/shell-registry.test.ts
git commit -m "test: add vnbdigital shell import coverage"
```

### Task 2: Implement VNBdigital parsing and shell candidate merge

**Files:**
- Create: `src/modules/operators/vnbdigital-shells.ts`
- Modify: `src/modules/operators/shell-registry.ts`
- Modify: `src/modules/operators/shell-import.ts`

**Step 1: Write the failing test**

Extend the test coverage to require:
- normalized candidate mapping
- slug reuse precedence: published operators first, existing shells second
- deterministic new slug generation for unmatched operators
- import summary count reflects merged result size

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/vnbdigital-shells.test.ts src/modules/operators/shell-import.test.ts`

Expected: FAIL because merge behavior is incomplete.

**Step 3: Write minimal implementation**

Implement:
- response schemas
- candidate mapping helpers
- slug normalization and matching helpers
- merged registry builder consumed by shell import helpers

**Step 4: Run test to verify it passes**

Run the targeted tests again until green.

**Step 5: Commit**

```bash
git add src/modules/operators/vnbdigital-shells.ts src/modules/operators/shell-registry.ts src/modules/operators/shell-import.ts src/modules/operators/vnbdigital-shells.test.ts src/modules/operators/shell-import.test.ts
git commit -m "feat: merge vnbdigital shells into registry"
```

### Task 3: Add a build script that refreshes the shell seed from VNBdigital

**Files:**
- Create: `scripts/registry/build-vnbdigital-shell-registry.ts`
- Modify: `package.json`
- Modify: `data/source-registry/operator-shells.seed.json`

**Step 1: Write the failing test**

Add coverage around the script-facing merge output if needed in:
- `src/modules/operators/vnbdigital-shells.test.ts`

Test for:
- stable ordering
- required fields on generated shells
- published operators retained in merged output

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/vnbdigital-shells.test.ts`

Expected: FAIL because the build output helper does not yet exist.

**Step 3: Write minimal implementation**

Implement the script to:
- fetch the VNBdigital list
- fetch details
- build merged shell entries
- rewrite `data/source-registry/operator-shells.seed.json`

**Step 4: Run test to verify it passes**

Run the targeted tests again until green.

**Step 5: Commit**

```bash
git add scripts/registry/build-vnbdigital-shell-registry.ts package.json data/source-registry/operator-shells.seed.json src/modules/operators/vnbdigital-shells.test.ts
git commit -m "feat: add vnbdigital shell registry builder"
```

### Task 4: Verify the full shell import path locally

**Files:**
- Modify only if verification exposes real defects

**Step 1: Run the builder**

Run: `pnpm build:shell-registry`

Expected: `operator-shells.seed.json` is regenerated with a nationwide baseline.

**Step 2: Run the shell import tests**

Run:
- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

Expected: all green.

**Step 3: Fix any failures minimally**

Only touch files required by failing verification.

**Step 4: Re-run verification**

Repeat until green.

**Step 5: Commit**

```bash
git add .
git commit -m "test: verify vnbdigital shell import pipeline"
```

### Task 5: Roll out to the LXC and confirm the new shell baseline

**Files:**
- Modify only if release verification exposes real defects

**Step 1: Ship the release bundle to the LXC**

Use the existing release flow documented in `docs/runbooks/lxc-release.md`.

**Step 2: Run production-side import**

Run on the LXC:
- `pnpm db:migrate`
- `pnpm shells:import`

Expected: the DB-backed shell count jumps from `37` to the new nationwide baseline.

**Step 3: Confirm the live internal API**

Check:
- `/api/operators/shells`
- stats fields for operator count, verified count, exact coverage count, source found count

**Step 4: Fix any rollout defects**

Only if the live environment reveals real integration issues.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: roll out nationwide shell baseline"
```
