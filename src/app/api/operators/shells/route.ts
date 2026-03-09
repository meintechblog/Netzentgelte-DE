import { getShellCatalogStats, loadOperatorShells } from "../../../../modules/operators/shell-catalog";
import { serializeOperatorShells } from "../../../../lib/api/serializers";

export async function GET(request: Request) {
  void request;
  const shells = await loadOperatorShells();

  return Response.json(
    serializeOperatorShells({
      items: shells,
      summary: getShellCatalogStats(shells)
    })
  );
}
