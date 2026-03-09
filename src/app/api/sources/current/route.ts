import { serializeCurrentSources } from "../../../../lib/api/serializers";
import { loadCurrentSources } from "../../../../modules/sources/current-sources";

export async function GET(request: Request) {
  void request;
  const sources = await loadCurrentSources();

  return Response.json(serializeCurrentSources(sources));
}
