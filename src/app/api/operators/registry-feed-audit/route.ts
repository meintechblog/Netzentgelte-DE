import { buildRegistryFeedAudit } from "../../../../modules/operators/registry-feed-audit";
import { loadOperatorShells } from "../../../../modules/operators/shell-catalog";

export async function GET(request: Request) {
  void request;

  const shells = await loadOperatorShells();
  const audit = buildRegistryFeedAudit(shells, {
    latestFeedSource: "bnetza-rollout-quote",
    latestFeedLabel: "2025-Q3"
  });

  return Response.json(audit);
}
