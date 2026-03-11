import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("vitest config", () => {
  test("excludes temporary batch worktrees from test discovery", () => {
    const configSource = readFileSync(join(process.cwd(), "vitest.config.ts"), "utf8");

    expect(configSource).toContain('".worktrees/**"');
  });
});
