import { serializeRegistryOperatorGeo } from "../../../../lib/api/serializers";
import { getOperatorRegistry } from "../../../../modules/operators/registry";

export async function GET(request: Request) {
  void request;
  const registry = getOperatorRegistry();

  return Response.json(serializeRegistryOperatorGeo(registry));
}
