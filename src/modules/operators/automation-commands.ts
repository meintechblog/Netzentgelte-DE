export type AutomationCommandPlan = {
  gate: string[];
  deploy: string[];
  liveChecks: string[];
};

export function buildAutomationCommandPlan(): AutomationCommandPlan {
  return {
    gate: [
      "pnpm test",
      "pnpm typecheck",
      "pnpm exec eslint src scripts",
      "NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm export:public",
      "NEXT_PUBLIC_BASE_PATH=/netzentgelte pnpm build"
    ],
    deploy: [
      "rsync -az --delete /Users/hulki/codex/netzentgelte/ root@192.168.3.178:/root/netzentgelte-de/",
      "ssh root@192.168.3.178 'cd /root/netzentgelte-de && pnpm install --frozen-lockfile && pnpm build && pkill -f \"next start\" || true && nohup pnpm start >/tmp/netzentgelte-start.log 2>&1 &'",
      "ssh root@192.168.3.178 'cd /root/netzentgelte-de && pnpm registry:import && pnpm shells:import'",
      "bash scripts/public/deploy-public-static.sh"
    ],
    liveChecks: [
      "curl -fsS http://192.168.3.178:3000 >/dev/null",
      "curl -fsS http://192.168.3.178:3000/api/operators >/dev/null",
      "curl -fsS https://kigenerated.de/netzentgelte/ >/dev/null"
    ]
  };
}
