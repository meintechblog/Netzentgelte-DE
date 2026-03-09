import { serializeRegistryTariffHistory } from "../../../../lib/api/serializers";
import { loadHistoricalTariffs } from "../../../../modules/operators/history-catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const operatorSlug = searchParams.get("operator");
  const entries = await loadHistoricalTariffs();
  const filteredEntries =
    operatorSlug === null ? entries : entries.filter((entry) => entry.slug === operatorSlug);

  return Response.json(serializeRegistryTariffHistory(filteredEntries));
}
