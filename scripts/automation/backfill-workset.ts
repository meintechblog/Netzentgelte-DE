import { pathToFileURL } from "node:url";

import { buildBackfillBatchWorkset } from "../../src/modules/operators/batch-workset";
import { loadOperatorShells } from "../../src/modules/operators/shell-catalog";
import { buildShellBackfillBatches } from "../../src/modules/operators/shell-batches";

export function getRequestedBatchId(cliArgs: string[]) {
  return cliArgs.find((arg) => arg !== "--");
}

async function main() {
  const requestedBatchId = getRequestedBatchId(process.argv.slice(2));

  if (!requestedBatchId) {
    throw new Error("Usage: pnpm automation:backfill-workset -- <batch-id>");
  }

  const shells = await loadOperatorShells();
  const batch = buildShellBackfillBatches(shells).batches.find((entry) => entry.id === requestedBatchId);

  if (!batch) {
    throw new Error(`Unknown batch id: ${requestedBatchId}`);
  }

  console.log(JSON.stringify(buildBackfillBatchWorkset(batch), null, 2));
}

const isDirectRun =
  typeof process.argv[1] === "string" && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectRun) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
