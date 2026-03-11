import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("package scripts", () => {
  test("automation-facing TypeScript scripts avoid the tsx CLI wrapper", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as {
      scripts: Record<string, string>;
    };

    const scriptNames = [
      "automation:backfill-koordinator",
      "automation:backfill-koordinator:dry-run",
      "ingest:run",
      "registry:import",
      "build:shell-registry",
      "shells:import",
      "sources:refresh",
      "sources:audit",
      "export:public"
    ];

    for (const scriptName of scriptNames) {
      expect(packageJson.scripts[scriptName]).toContain("node --import tsx");
      expect(packageJson.scripts[scriptName].startsWith("tsx ")).toBe(false);
    }
  });
});
