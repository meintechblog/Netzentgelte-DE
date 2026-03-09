import { serializeOperators } from "../../../lib/api/serializers";
import { runIngest } from "../../../modules/ingest/runner";

export async function GET(request: Request) {
  void request;
  const result = await runIngest("demo-operator");

  return Response.json(serializeOperators(result));
}
