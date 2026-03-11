import { describe, expect, test, vi } from "vitest";

import { buildRegistryImportPayload, summarizeRegistryImport } from "./registry-import";
import { persistRegistryImport } from "./registry-persist";
import { getOperatorRegistry } from "./registry";

describe("persistRegistryImport", () => {
  test("applies the import payload through the persistence gateway and records a run summary", async () => {
    const payload = buildRegistryImportPayload(getOperatorRegistry());
    const gateway = {
      upsertOperators: vi.fn(async () => undefined),
      upsertSources: vi.fn(async () => undefined),
      replaceTariffs: vi.fn(async () => undefined),
      insertRun: vi.fn(async () => undefined)
    };

    const result = await persistRegistryImport({
      gateway,
      payload,
      runType: "registry-import"
    });

    expect(gateway.upsertOperators).toHaveBeenCalledWith(payload.operators);
    expect(gateway.upsertSources).toHaveBeenCalledWith(payload.sources);
    expect(gateway.replaceTariffs).toHaveBeenCalledWith(payload.tariffs);
    expect(gateway.insertRun).toHaveBeenCalledWith({
      runType: "registry-import",
      status: "success",
      summary: summarizeRegistryImport(payload)
    });
    expect(result).toEqual(summarizeRegistryImport(payload));
  });
});
