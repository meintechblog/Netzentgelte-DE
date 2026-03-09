import { runIngest } from "../../src/modules/ingest/runner";

const operatorSlug = process.argv[2] ?? "demo-operator";

const result = await runIngest(operatorSlug);

console.log(JSON.stringify(result, null, 2));
