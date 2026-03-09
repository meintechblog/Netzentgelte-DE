import type { RegistryImportPayload } from "./registry-import";
import { summarizeRegistryImport } from "./registry-import";

export type RegistryPersistenceGateway = {
  upsertOperators: (rows: RegistryImportPayload["operators"]) => Promise<void>;
  upsertSources: (rows: RegistryImportPayload["sources"]) => Promise<void>;
  replaceTariffs: (rows: RegistryImportPayload["tariffs"]) => Promise<void>;
  insertRun: (input: {
    runType: string;
    status: "success" | "failed";
    summary: ReturnType<typeof summarizeRegistryImport>;
  }) => Promise<void>;
};

export async function persistRegistryImport(input: {
  gateway: RegistryPersistenceGateway;
  payload: RegistryImportPayload;
  runType: string;
}) {
  const summary = summarizeRegistryImport(input.payload);

  await input.gateway.upsertOperators(input.payload.operators);
  await input.gateway.upsertSources(input.payload.sources);
  await input.gateway.replaceTariffs(input.payload.tariffs);
  await input.gateway.insertRun({
    runType: input.runType,
    status: "success",
    summary
  });

  return summary;
}
