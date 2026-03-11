import { serializeRegistryOperators } from "../../../lib/api/serializers";
import { loadPublishedOperators } from "../../../modules/operators/current-catalog";

export async function GET(request: Request) {
  void request;
  const registry = await loadPublishedOperators();

  return Response.json(serializeRegistryOperators(registry));
}
