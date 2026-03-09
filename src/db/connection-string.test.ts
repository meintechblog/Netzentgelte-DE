import { describe, expect, test } from "vitest";

import { parseDatabaseUrl, resolveDatabaseUrl } from "./connection-string";

describe("parseDatabaseUrl", () => {
  test("accepts postgres connection strings", () => {
    expect(parseDatabaseUrl("postgresql://user:pass@localhost:5432/netzentgelte")).toBe(
      "postgresql://user:pass@localhost:5432/netzentgelte"
    );
  });
});

describe("resolveDatabaseUrl", () => {
  test("falls back to DATABASE_URL from .env-style content for CLI jobs", () => {
    expect(
      resolveDatabaseUrl({
        processEnv: {},
        envFileContents: "DATABASE_URL=postgresql://user:pass@localhost:5432/netzentgelte\n"
      })
    ).toBe("postgresql://user:pass@localhost:5432/netzentgelte");
  });
});
