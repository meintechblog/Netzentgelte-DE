# Backfill Koordinator Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore the `Backfill Koordinator` automation so it operates against the current worktree, deploys verified changes to the LXC, and republishes the static Hetzner site under `kigenerated.de/netzentgelte/`.

**Architecture:** Refresh the automation prompt and supporting deployment workflow around the current `endcustomer-backfill-batch` worktree. Keep heavy coordination on the Codex side, but make the release path reproducible by adding a project-owned deploy script and runbook updates. Validate the full flow manually before reactivating the hourly automation.

**Tech Stack:** Codex automation TOML, Next.js, pnpm, shell scripts, SSH, rsync, static snapshot export

---

### Task 1: Add a reproducible static deploy script

**Files:**
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/scripts/public/deploy-public-static.sh`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/hetzner-prod-rollout.md`
- Test: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/scripts/public/deploy-public-static.sh`

**Step 1: Write the failing dry-run expectation**

Document a dry-run command that should list the deploy targets without mutating the host.

**Step 2: Run dry-run to verify it fails**

Run: `bash scripts/public/deploy-public-static.sh --dry-run`
Expected: FAIL because the script does not exist yet.

**Step 3: Write minimal implementation**

Create a shell script that:
- requires `NEXT_PUBLIC_BASE_PATH=/netzentgelte`
- stages `.deploy-public`
- supports `--dry-run`
- uploads and publishes to the three known Hetzner target directories

**Step 4: Run dry-run to verify it passes**

Run: `bash scripts/public/deploy-public-static.sh --dry-run`
Expected: PASS and prints target directories plus planned upload steps.

**Step 5: Commit**

```bash
git add scripts/public/deploy-public-static.sh docs/runbooks/hetzner-prod-rollout.md
git commit -m "chore: add reusable static public deploy script"
```

### Task 2: Update automation runbook and coordinator contract

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/operator-curation-model.md`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/hetzner-prod-rollout.md`
- Modify: `/Users/hulki/.codex/memory.md`

**Step 1: Add the new coordinator contract to docs**

Document:
- current worktree path
- LXC deploy step
- static Hetzner publish step
- release gate including `pnpm test`, `pnpm typecheck`, targeted lint, `pnpm export:public`, `pnpm build`

**Step 2: Verify docs mention `kigenerated.de/netzentgelte/`**

Run: `rg -n "kigenerated.de/netzentgelte|endcustomer-backfill-batch|deploy-public-static" docs/runbooks /Users/hulki/.codex/memory.md`
Expected: PASS with updated references.

**Step 3: Commit**

```bash
git add docs/runbooks/operator-curation-model.md docs/runbooks/hetzner-prod-rollout.md /Users/hulki/.codex/memory.md
git commit -m "docs: refresh coordinator deployment contract"
```

### Task 3: Refresh the Backfill Koordinator automation definition

**Files:**
- Modify: `/Users/hulki/.codex/automations/backfill-koordinator/automation.toml`

**Step 1: Update the automation prompt**

Replace stale `bootstrap` and old deploy assumptions with:
- current worktree
- current batch APIs
- current verification gate
- LXC sync/build/start
- static Hetzner publish via project script
- GitHub push only on verified integration changes

**Step 2: Update execution settings**

Set:
- `cwds` to the current worktree and `/Users/hulki`
- `status` to `ACTIVE`
- keep hourly cadence

**Step 3: Verify TOML**

Run: `python3 - <<'PY'\nimport tomllib, pathlib\nprint(tomllib.loads(pathlib.Path('/Users/hulki/.codex/automations/backfill-koordinator/automation.toml').read_text()))\nPY`
Expected: PASS and parsed TOML output.

### Task 4: Run an operational dry run on the project

**Files:**
- Use: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch`

**Step 1: Run project verification**

Run:
- `pnpm test`
- `pnpm typecheck`
- `pnpm exec eslint src scripts docs`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public`
- `NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build`

Expected: PASS.

**Step 2: Run LXC deployment test**

Sync the current worktree to `/root/netzentgelte-de`, rebuild, restart, and verify:
- `http://192.168.3.178:3000`
- `/api/operators`

**Step 3: Run Hetzner static deploy test**

Run: `bash scripts/public/deploy-public-static.sh`
Expected: PASS.

**Step 4: Verify public site**

Run:
- `curl -I https://kigenerated.de/netzentgelte/`
- `curl -fsS https://kigenerated.de/netzentgelte/ | grep -i '<title>Netzentgelte Deutschland'`

Expected: PASS.

### Task 5: Commit, push, and reactivate automation

**Files:**
- Modify if needed: `/Users/hulki/.codex/automations/backfill-koordinator/automation.toml`

**Step 1: Commit project changes**

```bash
git add scripts/public/deploy-public-static.sh docs/runbooks/operator-curation-model.md docs/runbooks/hetzner-prod-rollout.md docs/plans/2026-03-11-backfill-koordinator-refresh-design.md docs/plans/2026-03-11-backfill-koordinator-refresh.md
git commit -m "chore: refresh backfill coordinator automation"
```

**Step 2: Push branch**

Run: `git push origin codex/endcustomer-backfill-batch`
Expected: PASS.

**Step 3: Final automation sanity check**

Verify the automation TOML is `ACTIVE`, points at the correct cwd, and still uses an hourly schedule.

