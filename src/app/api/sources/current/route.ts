import { serializeCurrentSources } from "../../../../lib/api/serializers";
import { loadPublishedOperators } from "../../../../modules/operators/current-catalog";
import { loadCurrentSources } from "../../../../modules/sources/current-sources";

export async function GET(request: Request) {
  void request;
  const operators = await loadPublishedOperators();
  const sources = await loadCurrentSources();
  const publishedOperatorSlugs = new Set(operators.map((entry) => entry.slug));

  return Response.json(
    serializeCurrentSources(sources.filter((row) => publishedOperatorSlugs.has(row.operatorSlug)))
  );
}
