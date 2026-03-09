# Endcustomer Batch 001 Plan

## Goal

Import the first multi-operator endcustomer batch into the shared low-voltage model.

## Task 1: Write failing tests for multi-operator seed coverage

Update:

- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-reference.test.ts`
- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-catalog.test.ts`
- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-integrity.test.ts`
- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/tariffs/endcustomer/current/route.test.ts`

Cover:

- seed references include the four new published operators
- audit summary improves from `1 complete` to `5 complete`
- current endcustomer API exposes the new operators

Run:

```bash
pnpm test src/modules/tariffs/endcustomer-reference.test.ts src/modules/tariffs/endcustomer-catalog.test.ts src/modules/tariffs/endcustomer-integrity.test.ts src/app/api/tariffs/endcustomer/current/route.test.ts
```

Expected: FAIL because only Schwäbisch Hall exists today.

## Task 2: Implement shared multi-operator references

Update:

- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-reference.ts`
- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-catalog.ts`

Implement:

- shared reference list
- operator names in reference data
- four new official 2026 operator references

## Task 3: Turn the import CLI into a batch importer

Update:

- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/scripts/tariffs/import-endcustomer-reference.ts`

Implement:

- import all references by default
- optional single-operator filter for targeted reruns
- multi-summary output

## Task 4: Verify locally and on the LXC

Run:

```bash
pnpm test src/modules/tariffs/endcustomer-reference.test.ts src/modules/tariffs/endcustomer-catalog.test.ts src/modules/tariffs/endcustomer-integrity.test.ts src/app/api/tariffs/endcustomer/current/route.test.ts src/app/api/tariffs/endcustomer/audit/route.test.ts src/lib/view-models/tariffs.test.ts
pnpm lint
pnpm build
pnpm typecheck
```

Then on the LXC:

```bash
pnpm tsx scripts/tariffs/import-endcustomer-reference.ts
```

Confirm:

- `/api/tariffs/endcustomer/current`
- `/api/tariffs/endcustomer/audit`

