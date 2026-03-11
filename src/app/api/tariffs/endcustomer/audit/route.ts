import { loadPublishedOperators } from "../../../../../modules/operators/current-catalog";
import { loadEndcustomerTariffCatalog } from "../../../../../modules/tariffs/endcustomer-catalog";
import {
  buildEndcustomerIntegrityAudit,
  getEndcustomerIntegrityAuditSummary,
  getNextEndcustomerBackfillTargets
} from "../../../../../modules/tariffs/endcustomer-integrity";

export async function GET(request: Request) {
  void request;

  const [operators, catalog] = await Promise.all([
    loadPublishedOperators(),
    loadEndcustomerTariffCatalog()
  ]);

  const items = buildEndcustomerIntegrityAudit(operators, catalog);

  return Response.json({
    summary: getEndcustomerIntegrityAuditSummary(items),
    nextTargets: getNextEndcustomerBackfillTargets(items, 10),
    items
  });
}
