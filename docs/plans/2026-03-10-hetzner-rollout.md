# Hetzner Rollout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Roll out Netzentgelte Deutschland from the LXC source to the Hetzner host under `/netzentgelte-deutschland` with atomic releases, its own database, a dedicated systemd service, and subpath-safe Next.js routing.

**Architecture:** The existing Next.js app will be made aware of the production subpath through config and path helpers so UI links and generated artifact URLs work correctly behind a reverse proxy. Deployment will use a Capistrano-style release layout on Hetzner with a shared `.env`, a `current` symlink, database migrations against the new production Postgres, and a dedicated reverse-proxy rule that forwards only the new subpath to port `3100`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest, Drizzle/Postgres, systemd, Apache reverse proxy

---

### Task 1: Add failing tests for subpath-safe URLs

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/lib/view-models/tariffs.test.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/sources/current-sources.test.ts`

**Step 1: Write the failing test**

Add assertions that generated API and artifact URLs are prefixed with `/netzentgelte-deutschland` when `NEXT_PUBLIC_BASE_PATH` is set.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/modules/sources/current-sources.test.ts`
Expected: FAIL because helpers still return root-relative `/api/...` paths.

**Step 3: Write minimal implementation**

Introduce a shared base-path helper and use it for public links and artifact URLs.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/modules/sources/current-sources.test.ts`
Expected: PASS

### Task 2: Make app routing and config subpath-safe

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/next.config.ts`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/lib/base-path.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/app/page.tsx`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/sources/current-sources.ts`
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/src/modules/operators/history-catalog.ts`

**Step 1: Write the failing test**

Extend tests or add targeted cases for the helpers and page links.

**Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/modules/sources/current-sources.test.ts`
Expected: FAIL on missing base path in generated links.

**Step 3: Write minimal implementation**

Set `basePath` and `assetPrefix` in Next.js for production, add a normalizer helper, and replace hardcoded root-relative API links.

**Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/view-models/tariffs.test.ts src/modules/sources/current-sources.test.ts`
Expected: PASS

### Task 3: Run the full local quality gates

**Files:**
- Verify only

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 2: Run tests**

Run: `pnpm test`
Expected: PASS, including `src/lib/view-models/tariffs.test.ts`

**Step 3: Run production build**

Run: `pnpm build`
Expected: PASS

### Task 4: Build a reproducible release artifact from the LXC source

**Files:**
- Modify: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/lxc-release.md`
- Create: `/Users/hulki/projects/netzentgelte-de/.worktrees/endcustomer-backfill-batch/docs/runbooks/hetzner-release.md`

**Step 1: Create release procedure**

Document and script the release artifact contents and exclusions.

**Step 2: Build and transfer artifact**

Use `tar` over SSH from `/root/netzentgelte-de` on CT128 to a timestamped release directory on Hetzner.

**Step 3: Verify unpacked release**

Ensure the new release contains the built app, package metadata, scripts, and no transient junk.

### Task 5: Provision Hetzner runtime and activate release

**Files:**
- Create on target: `/etc/systemd/system/netzentgelte-deutschland.service`
- Create on target: Apache site/conf snippet for `/netzentgelte-deutschland`
- Create on target: `/netzentgelte-deutschland/shared/.env`

**Step 1: Prepare release directories**

Create `/netzentgelte-deutschland/releases/<timestamp>`, `/netzentgelte-deutschland/shared`, `/netzentgelte-deutschland/logs`, and update `/netzentgelte-deutschland/current`.

**Step 2: Wire environment and migrations**

Link shared `.env`, run `pnpm db:migrate` against the new database from the release path.

**Step 3: Create and enable service**

Run the app from the `current` symlink on port `3100`.

**Step 4: Add reverse proxy rule**

Proxy only `/netzentgelte-deutschland` to `127.0.0.1:3100`, preserving existing Apache/PRINCE2 setup.

### Task 6: Verify live rollout and record rollback path

**Files:**
- Verify only

**Step 1: Verify service health**

Run: `systemctl status netzentgelte-deutschland --no-pager`
Expected: active/running

**Step 2: Verify logs**

Run: `journalctl -u netzentgelte-deutschland -n 100 --no-pager`
Expected: no startup crash, app serving on `3100`

**Step 3: Verify HTTP**

Run: `curl -I <final-url>`, `curl -fsS <final-url> | grep -i '<title>'`, and API checks under the subpath.
Expected: `200`, title contains `Netzentgelte Deutschland`, no `5xx`

**Step 4: Record rollback**

Capture the one-line symlink rollback command to the previous release.
