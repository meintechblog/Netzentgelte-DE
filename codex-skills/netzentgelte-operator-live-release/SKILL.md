---
name: netzentgelte-operator-live-release
description: Use when working in Netzentgelte-DE on exactly one grid operator from official 2026 evidence through commit, deploy, and verified live publication, especially when a local data change must not count as done until the live site shows the final state.
---

# Netzentgelte Operator Live Release

## Overview

Use this skill when one operator must be processed end-to-end in `Netzentgelte-DE`.

Core rule: an operator is not done when the local files look correct. The run is done only when the live site, live snapshot, and release checks show the operator in the intended final state.

## Use This Skill For

- "Bearbeite genau einen weiteren Netzbetreiber end-to-end"
- "Zieh den nächsten Betreiber live durch"
- "Promote the next operator to verified"
- "Publish the next operator even if data is incomplete"
- Fixing cases where local registry data exists but the live site still shows `pending`, missing values, or stale output

## Mandatory Outcome

Exactly one operator must leave the run in one of these final live states:

- `verified`
- `violation`
- `missing-data`
- `blocked`

It must be visible on [https://kigenerated.de/netzentgelte/](https://kigenerated.de/netzentgelte/).

If the operator is fully verified, the live UI must show the real low-voltage product details and Modul-3 values, not only generic status text.

## Workflow

1. Start in `/Users/hulki/projects/netzentgelte-de` on `main`.
2. Run the verified operator dry-run and take the strongest candidate.
3. Use only official 2026 source pages and official PDFs.
4. Decide whether the operator is:
   - fully `verified`
   - publishable with `violation`
   - publishable with `missing-data`
   - `blocked`
5. Update all required registry surfaces together:
   - `data/source-registry/operator-shells.seed.json`
   - `data/source-registry/operators.seed.json`
   - `src/modules/tariffs/endcustomer-reference.ts` when a low-voltage product is publishable
   - tests that assert catalog, API, and endcustomer visibility
6. If a verified low-voltage product exists, make sure the UI can show:
   - Modul 1 values
   - Modul 2 values
   - Modul 3 `NT/ST/HT`
   - quarter or full-year time windows
   - metering values when available
7. Suppress positive boilerplate when nothing is wrong:
   - do not show generic "Verifiziertes Niederspannungsprodukt vorhanden"
   - do not show default status chips such as `Geprueft`, `Veroeffentlicht`, `Regelkonform` unless they add signal
8. Run verification serially, not in parallel:
   - `pnpm test`
   - `pnpm typecheck`
   - `pnpm exec eslint src scripts`
   - `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
   - `rm -rf .next && NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`
9. Commit and push only after all checks are green.
10. Deploy both targets:
   - root host at `192.168.3.178:3000`
   - static public site at `https://kigenerated.de/netzentgelte/`
11. Perform live checks before declaring success:
   - homepage
   - `data/netzentgelte/meta.json`
   - `data/netzentgelte/snapshot.json`
   - dev API when relevant
12. Mark the operator in the verified loop as `completed` or `blocked` only after the live checks confirm the final state.

## Hard Live Gate

Never end the run after local edits alone.

If any of these is still wrong after deploy, the operator is not done and the same run must continue:

- the operator is missing from the live homepage
- the live snapshot still shows the old status
- the low-voltage product is verified locally but not visible live
- the live UI still shows stale boilerplate or missing tariff details
- the pending count or snapshot state did not move as expected

Do not move on to the next operator until the current one is correct live.

## Publication Rules

- Prefer operators without a fully verified low-voltage product first.
- If full verification is possible, publish as `reviewStatus=verified`.
- If full verification is not possible, still publish the operator with:
  - checked official source page
  - checked official document URL
  - transparent problem reason
  - missing fields called out explicitly
- Never use non-official sources as tariff truth.

## Release Commands

Use the project scripts and current release path. At minimum the run must include:

```bash
pnpm automation:verified-operator-loop:dry-run
pnpm test
pnpm typecheck
pnpm exec eslint src scripts
NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public
rm -rf .next && NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build
bash scripts/public/deploy-public-static.sh --skip-build
```

For the root host, use the current LXC sync and rebuild flow from:

- `src/modules/operators/automation-commands.ts`
- `docs/runbooks/lxc-release.md`

## Live Check Minimum

Check all of these after deploy:

```bash
curl -fsS https://kigenerated.de/netzentgelte/data/netzentgelte/meta.json
curl -fsS https://kigenerated.de/netzentgelte/data/netzentgelte/snapshot.json
curl -fsS https://kigenerated.de/netzentgelte/
```

Use targeted `jq` or `rg` queries to confirm the specific operator state.

## Completion Rule

A run is complete only when:

- code and data are committed and pushed
- deploy succeeded
- live snapshot matches the intended operator state
- live UI reflects the intended detail level
- verified loop state is updated after the live proof

If any one of these is missing, the run is incomplete.
