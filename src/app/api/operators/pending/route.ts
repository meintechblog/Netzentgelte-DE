import { serializePendingOperatorCatalog } from "../../../../lib/api/serializers";
import { loadPendingOperatorCatalog } from "../../../../modules/operators/pending-catalog";

export async function GET(request: Request) {
  void request;

  const catalog = await loadPendingOperatorCatalog();

  return Response.json(serializePendingOperatorCatalog(catalog));
}
