import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, test } from "vitest";

import type { PublicSnapshot } from "./schema";
import { writePublicSnapshotFiles } from "./export-public-snapshot";

const createdDirectories: string[] = [];

afterEach(async () => {
  const { rm } = await import("node:fs/promises");

  await Promise.all(createdDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("writePublicSnapshotFiles", () => {
  test("writes snapshot and metadata into a deterministic public directory", async () => {
    const outputRoot = await mkdtemp(join(tmpdir(), "netzentgelte-public-"));
    createdDirectories.push(outputRoot);

    const snapshot: PublicSnapshot = {
      generatedAt: "2026-03-10T18:30:00.000Z",
      operatorCount: 1,
      operators: [],
      map: {
        attribution: "GeoBasis-DE",
        hiddenOperatorCount: 0,
        mappedOperatorCount: 0,
        operators: [],
        states: []
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
    };

    const result = await writePublicSnapshotFiles({
      outputRoot,
      snapshot
    });

    expect(result.snapshotPath).toBe(join(outputRoot, "netzentgelte", "snapshot.json"));
    expect(result.metaPath).toBe(join(outputRoot, "netzentgelte", "meta.json"));

    const persistedSnapshot = JSON.parse(await readFile(result.snapshotPath, "utf8"));
    const persistedMeta = JSON.parse(await readFile(result.metaPath, "utf8"));

    expect(persistedSnapshot).toMatchObject(snapshot);
    expect(persistedMeta).toEqual({
      generatedAt: "2026-03-10T18:30:00.000Z",
      operatorCount: 1
    });
  });
});
