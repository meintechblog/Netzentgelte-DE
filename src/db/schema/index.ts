import { getTableName } from "drizzle-orm";

import { ingestRuns } from "./ingest-runs";
import { operatorGeometries } from "./geometries";
import { operatorShells } from "./operator-shells";
import { operators } from "./operators";
import { sourceCatalog, sourceSnapshots } from "./sources";
import { tariffVersions } from "./tariffs";

export { ingestRuns } from "./ingest-runs";
export { operatorGeometries } from "./geometries";
export { operatorShells } from "./operator-shells";
export { operators } from "./operators";
export { sourceCatalog, sourceSnapshots } from "./sources";
export { tariffVersions } from "./tariffs";

export const schemaTables = [
  operatorShells,
  operators,
  sourceCatalog,
  sourceSnapshots,
  tariffVersions,
  operatorGeometries,
  ingestRuns
];

export const tables = schemaTables.map((table) => getTableName(table));
