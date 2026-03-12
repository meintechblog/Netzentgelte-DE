import { describe, expect, test } from "vitest";

import { buildAutomationCommandPlan } from "./automation-commands";

describe("buildAutomationCommandPlan", () => {
  test("assembles the verification, deploy and live-check commands in the required order", () => {
    const plan = buildAutomationCommandPlan();

    expect(plan.gate).toEqual([
      "pnpm test",
      "pnpm typecheck",
      "pnpm exec eslint src scripts",
      "NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public",
      "NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build"
    ]);

    expect(plan.deploy).toEqual([
      "rsync -az --delete --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='.playwright-cli' --exclude='.deploy-public' --exclude='.worktrees' --exclude='data/artifacts' --exclude='tmp' /Users/hulki/projects/netzentgelte-de/ root@192.168.3.178:/root/netzentgelte-de/",
      "ssh root@192.168.3.178 'cd /root/netzentgelte-de && pnpm install --frozen-lockfile && rm -rf .next && env -u NEXT_PUBLIC_BASE_PATH pnpm build && old_pid=$(ss -ltnp | sed -n \"s/.*:3000 .*pid=\\\\([0-9]\\\\+\\\\).*/\\\\1/p\" | head -n 1) && if [ -n \"$old_pid\" ]; then kill \"$old_pid\"; fi && nohup pnpm start >/tmp/netzentgelte-start.log 2>&1 &'",
      "ssh root@192.168.3.178 'cd /root/netzentgelte-de && if [ -n \"$DATABASE_URL\" ]; then pnpm registry:import && pnpm shells:import; else echo \"Skipping registry import: DATABASE_URL not set.\"; fi'",
      "bash scripts/public/deploy-public-static.sh"
    ]);

    expect(plan.liveChecks).toEqual([
      "curl -fsS http://192.168.3.178:3000 | rg 'href=\"/_next/static/css/'",
      "curl -fsS http://192.168.3.178:3000/api/operators >/dev/null",
      "curl -fsS https://kigenerated.de/netzentgelte/ >/dev/null"
    ]);
  });
});
