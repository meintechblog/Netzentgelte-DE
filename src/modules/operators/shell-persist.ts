import type { ShellImportPayload } from "./shell-import";
import { summarizeShellImport } from "./shell-import";

export type ShellPersistenceGateway = {
  replaceShells: (rows: ShellImportPayload["shells"]) => Promise<void>;
  insertRun: (input: {
    runType: string;
    status: "success" | "failed";
    summary: ReturnType<typeof summarizeShellImport>;
  }) => Promise<void>;
};

export async function persistShellImport(input: {
  gateway: ShellPersistenceGateway;
  payload: ShellImportPayload;
  runType: string;
}) {
  const summary = summarizeShellImport(input.payload);

  await input.gateway.replaceShells(input.payload.shells);
  await input.gateway.insertRun({
    runType: input.runType,
    status: "success",
    summary
  });

  return summary;
}
