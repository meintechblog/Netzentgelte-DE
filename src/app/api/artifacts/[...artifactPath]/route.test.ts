import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { GET } from "./route";

let artifactRootDir: string;

beforeEach(async () => {
  artifactRootDir = await mkdtemp(path.join(tmpdir(), "netzentgelte-artifacts-"));
  process.env.ARTIFACTS_ROOT_DIR = artifactRootDir;
  await mkdir(path.join(artifactRootDir, "netze-bw-netze-bw-14a-2026", "2026-03-09"), {
    recursive: true
  });
  await writeFile(
    path.join(artifactRootDir, "netze-bw-netze-bw-14a-2026", "2026-03-09", "sample.txt"),
    "snapshot review"
  );
});

afterEach(async () => {
  delete process.env.ARTIFACTS_ROOT_DIR;
  await rm(artifactRootDir, { recursive: true, force: true });
});

describe("GET /api/artifacts/[...artifactPath]", () => {
  test("serves a stored artifact below the configured artifact root", async () => {
    const response = await GET(
      new Request("http://localhost/api/artifacts/netze-bw-netze-bw-14a-2026/2026-03-09/sample.txt"),
      {
        params: Promise.resolve({
          artifactPath: ["netze-bw-netze-bw-14a-2026", "2026-03-09", "sample.txt"]
        })
      }
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("snapshot review");
  });

  test("rejects traversal attempts outside the artifact root", async () => {
    const response = await GET(new Request("http://localhost/api/artifacts/../../etc/passwd"), {
      params: Promise.resolve({
        artifactPath: ["..", "..", "etc", "passwd"]
      })
    });

    expect(response.status).toBe(400);
  });
});
