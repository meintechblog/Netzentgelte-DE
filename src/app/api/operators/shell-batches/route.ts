import { buildShellBackfillBatches, getShellBatchSummary } from "../../../../modules/operators/shell-batches";
import { loadOperatorShells } from "../../../../modules/operators/shell-catalog";

export async function GET(request: Request) {
  void request;
  const shells = await loadOperatorShells();
  const result = buildShellBackfillBatches(shells);

  return Response.json({
    summary: getShellBatchSummary(result.batches, result.summary),
    items: result.batches
  });
}
