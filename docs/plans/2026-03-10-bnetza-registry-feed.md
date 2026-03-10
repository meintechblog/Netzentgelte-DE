# BNetzA Registry Feed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist quarterly BNetzA shell-feed evidence, add deprecated-state scaffolding, and prioritize newly surfaced operators for backfill.

**Architecture:** Extend shell registry data and DB persistence with feed/deprecated metadata, add an internal registry-audit read model, and update shell batching so fresh BNetzA additions are prioritized ahead of generic discovery.

**Tech Stack:** Next.js, TypeScript, Vitest, Drizzle/Postgres

---

### Task 1: Cover the new registry metadata with failing tests

**Files:**
- Modify: `src/modules/operators/shell-registry.test.ts`
- Modify: `src/modules/operators/shell-batches.test.ts`
- Create: `src/modules/operators/registry-feed-audit.test.ts`
- Create: `src/app/api/operators/registry-feed-audit/route.test.ts`

**Step 1: Write the failing tests**

Add tests that require:

- rollout-fed entries expose feed metadata and `deprecatedStatus`
- shell batching creates a `registry-review` lane for latest-feed entries without sources
- the registry audit returns items for `latest-feed-newcomer`, `disappearance-review`, and `deprecated`

**Step 2: Run test to verify it fails**

Run: `pnpm test src/modules/operators/shell-registry.test.ts src/modules/operators/shell-batches.test.ts src/modules/operators/registry-feed-audit.test.ts src/app/api/operators/registry-feed-audit/route.test.ts`

Expected: FAIL because the metadata, audit module, and route do not exist yet.

### Task 2: Implement the minimal registry metadata model

**Files:**
- Modify: `src/modules/operators/shell-registry.ts`
- Modify: `src/modules/operators/shell-catalog.ts`
- Modify: `src/lib/api/serializers.ts`
- Modify: `data/source-registry/operator-shells.seed.json`

**Step 1: Add the new schema fields**

Implement:

- `registryFeedSource?: string`
- `registryFeedLabel?: string`
- `lastSeenInRegistryFeed?: string`
- `deprecatedStatus?: "active" | "disappearance-review" | "deprecated"`
- `deprecatedCheckedAt?: string`
- `deprecatedReason?: string`

Default `deprecatedStatus` to `active`.

**Step 2: Make the tests pass**

Run: `pnpm test src/modules/operators/shell-registry.test.ts`

Expected: PASS

### Task 3: Implement registry-review batching and audit feed

**Files:**
- Modify: `src/modules/operators/shell-batches.ts`
- Modify: `src/modules/operators/backfill-briefing.ts`
- Modify: `src/app/api/operators/backfill-briefing/route.ts`
- Create: `src/modules/operators/registry-feed-audit.ts`
- Create: `src/app/api/operators/registry-feed-audit/route.ts`

**Step 1: Add the new lane and audit actions**

- classify latest BNetzA newcomers into `registry-review`
- prefer `registry-review` as the next batch in the briefing
- expose registry audit items via a new internal API route

**Step 2: Run tests**

Run: `pnpm test src/modules/operators/shell-batches.test.ts src/modules/operators/registry-feed-audit.test.ts src/app/api/operators/registry-feed-audit/route.test.ts`

Expected: PASS

### Task 4: Persist the metadata in Postgres

**Files:**
- Modify: `src/db/schema/operator-shells.ts`
- Modify: `src/modules/operators/shell-import.ts`
- Modify: `scripts/registry/import-shell-registry.ts`
- Create: `drizzle/0009_operator_shell_registry_feed.sql`

**Step 1: Add the DB columns and import mapping**

Persist the new feed/deprecated fields in `operator_shells`.

**Step 2: Verify import path**

Run: `pnpm test src/modules/operators/shell-import.test.ts`

Expected: PASS

### Task 5: Verify, import on LXC, and confirm live state

**Files:**
- No code changes expected

**Step 1: Run full relevant verification**

Run:

- `pnpm test src/modules/operators/shell-registry.test.ts src/modules/operators/shell-batches.test.ts src/modules/operators/registry-feed-audit.test.ts src/app/api/operators/registry-feed-audit/route.test.ts src/app/api/operators/shells/route.test.ts`
- `pnpm lint`
- `pnpm build`
- `pnpm typecheck`

**Step 2: Import on LXC and verify**

Run remote import and check:

- `/api/operators/shells`
- `/api/operators/shell-batches`
- `/api/operators/backfill-briefing`
- `/api/operators/registry-feed-audit`

**Step 3: Commit**

Commit message:

```bash
git commit -m "feat: add bnetza registry feed audit"
```
