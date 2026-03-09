import { loadEndcustomerTariffCatalog } from "../../../../../modules/tariffs/endcustomer-catalog";

export async function GET(request: Request) {
  void request;

  const items = await loadEndcustomerTariffCatalog();

  return Response.json({
    summary: {
      operatorCount: items.length
    },
    items
  });
}
