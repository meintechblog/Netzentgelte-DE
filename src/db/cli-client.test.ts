import { describe, expect, test } from "vitest";

import { resolveCliDatabaseUrl } from "./cli-client";

describe("resolveCliDatabaseUrl", () => {
  test("prefers the current process env when running a cli script", () => {
    expect(
      resolveCliDatabaseUrl({
        processEnv: {
          DATABASE_URL: "postgres://user:pass@localhost:5432/netzentgelte"
        }
      })
    ).toBe("postgres://user:pass@localhost:5432/netzentgelte");
  });

  test("falls back to env file contents when process env is empty", () => {
    expect(
      resolveCliDatabaseUrl({
        processEnv: {},
        envFileContents: "DATABASE_URL=postgres://user:pass@localhost:5432/netzentgelte\n"
      })
    ).toBe("postgres://user:pass@localhost:5432/netzentgelte");
  });
});
