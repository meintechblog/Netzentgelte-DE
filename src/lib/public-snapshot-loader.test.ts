import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, test } from "vitest";

import { loadPublicSnapshotFromDisk } from "./public-snapshot-loader";

const createdDirectories: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");

  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("loadPublicSnapshotFromDisk", () => {
  test("returns null when no exported snapshot exists", async () => {
    const root = await mkdtemp(join(tmpdir(), "netzentgelte-snapshot-loader-"));
    createdDirectories.push(root);

    await expect(loadPublicSnapshotFromDisk({ cwd: root })).resolves.toBeNull();
  });

  test("parses an exported snapshot from the public directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "netzentgelte-snapshot-loader-"));
    createdDirectories.push(root);

    const snapshotDirectory = join(root, "public", "netzentgelte");
    await mkdir(snapshotDirectory, { recursive: true });
    await writeFile(
      join(snapshotDirectory, "snapshot.json"),
      JSON.stringify({
        generatedAt: "2026-03-10T19:00:00.000Z",
        operatorCount: 0,
        operators: [],
        map: {
          attribution: "GeoBasis-DE",
          mappedOperatorCount: 0,
          hiddenOperatorCount: 0,
          states: [],
          operators: []
        },
        sources: [],
        compliance: {
          ruleSetId: "modul-3",
          title: "§14a Modul 3",
          version: "2026",
          sourceDocumentUrl: "https://example.com/rules.pdf",
          sourceDocumentLabel: "Regelwerk",
          rules: []
        }
      }),
      "utf8"
    );

    await expect(loadPublicSnapshotFromDisk({ cwd: root })).resolves.toMatchObject({
      generatedAt: "2026-03-10T19:00:00.000Z",
      operatorCount: 0
    });
  });
});
