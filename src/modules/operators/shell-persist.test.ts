import { describe, expect, test, vi } from "vitest";

import { buildShellImportPayload } from "./shell-import";
import { persistShellImport } from "./shell-persist";
import { getOperatorShellRegistry } from "./shell-registry";

describe("persistShellImport", () => {
  test("writes shells and records an ingest run summary", async () => {
    const payload = buildShellImportPayload(getOperatorShellRegistry());
    const gateway = {
      replaceShells: vi.fn(async () => {}),
      insertRun: vi.fn(async () => {})
    };

    const summary = await persistShellImport({
      gateway,
      payload,
      runType: "shell-registry-import"
    });

    expect(gateway.replaceShells).toHaveBeenCalledWith(payload.shells);
    expect(gateway.insertRun).toHaveBeenCalledWith({
      runType: "shell-registry-import",
      status: "success",
      summary
    });
    expect(summary.operatorCount).toBe(payload.shells.length);
  });
});
