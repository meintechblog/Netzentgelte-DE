import { buildBackfillBriefing } from "../../../../modules/operators/backfill-briefing";
import { buildShellBackfillBatches } from "../../../../modules/operators/shell-batches";
import { loadOperatorShells } from "../../../../modules/operators/shell-catalog";
import { getSeedOperatorStructureAudit } from "../../../../modules/operators/structure-audit";

export async function GET(request: Request) {
  void request;

  const [shells, auditItems] = await Promise.all([
    loadOperatorShells(),
    Promise.resolve(getSeedOperatorStructureAudit())
  ]);
  const batches = buildShellBackfillBatches(shells).batches;
  const briefing = buildBackfillBriefing({
    auditItems,
    batches
  });

  return Response.json(briefing);
}
