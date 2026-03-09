import {
  getOperatorStructureAuditSummary,
  getSeedOperatorStructureAudit
} from "../../../../modules/operators/structure-audit";

export async function GET(request: Request) {
  void request;

  const items = getSeedOperatorStructureAudit();

  return Response.json({
    summary: getOperatorStructureAuditSummary(items),
    items
  });
}
