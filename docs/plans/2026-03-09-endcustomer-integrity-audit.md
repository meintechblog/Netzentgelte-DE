# Endcustomer Integrity Audit Plan

## Goal

Unify endcustomer completeness rules and expose a safe internal audit feed for published operators.

## Task 1: Write failing tests for shared integrity behavior

Create:

- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-integrity.test.ts`

Cover:

- the Schwäbisch-Hall reference is selected as a complete verified set
- missing requirements or missing metering mark an entry as incomplete
- published operators without any endcustomer entry are surfaced as missing

Run:

```bash
pnpm test src/modules/tariffs/endcustomer-integrity.test.ts
```

Expected: FAIL because the shared integrity module does not exist yet.

## Task 2: Implement the shared integrity module

Create:

- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/modules/tariffs/endcustomer-integrity.ts`

Implement:

- strict module-level completeness checks
- shared current-set selection
- operator-level audit generation
- summary helper

## Task 3: Reuse integrity rules in the public view-model

Update:

- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.ts`
- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/lib/view-models/tariffs.test.ts`

Replace the local product-selection helpers with the shared integrity functions so public rendering and internal audit stay in lockstep.

Run:

```bash
pnpm test src/lib/view-models/tariffs.test.ts src/modules/tariffs/endcustomer-integrity.test.ts
```

## Task 4: Add the internal audit API

Create:

- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/tariffs/endcustomer/audit/route.ts`
- `/Users/hulki/projects/netzentgelte-de/.worktrees/bootstrap/src/app/api/tariffs/endcustomer/audit/route.test.ts`

Expose:

- summary counts
- per-operator items
- suggested next targets

Run:

```bash
pnpm test src/app/api/tariffs/endcustomer/audit/route.test.ts
```

## Task 5: Verify and commit

Run:

```bash
pnpm test src/modules/tariffs/endcustomer-integrity.test.ts src/lib/view-models/tariffs.test.ts src/app/api/tariffs/endcustomer/audit/route.test.ts src/app/api/tariffs/endcustomer/current/route.test.ts src/app/page.test.tsx
pnpm lint
pnpm build
pnpm typecheck
```

Commit:

```bash
git add docs/plans/2026-03-09-endcustomer-integrity-audit-design.md docs/plans/2026-03-09-endcustomer-integrity-audit.md src/modules/tariffs/endcustomer-integrity.ts src/modules/tariffs/endcustomer-integrity.test.ts src/lib/view-models/tariffs.ts src/lib/view-models/tariffs.test.ts src/app/api/tariffs/endcustomer/audit/route.ts src/app/api/tariffs/endcustomer/audit/route.test.ts
git commit -m "feat: add endcustomer integrity audit"
```
