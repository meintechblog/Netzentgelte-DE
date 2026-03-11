import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { PublicSnapshot } from "./schema";

export type WritePublicSnapshotFilesInput = {
  outputRoot: string;
  snapshot: PublicSnapshot;
};

export type WritePublicSnapshotFilesResult = {
  snapshotPath: string;
  metaPath: string;
};

export async function writePublicSnapshotFiles(
  input: WritePublicSnapshotFilesInput
): Promise<WritePublicSnapshotFilesResult> {
  const snapshotDirectory = join(input.outputRoot, "netzentgelte");
  const snapshotPath = join(snapshotDirectory, "snapshot.json");
  const metaPath = join(snapshotDirectory, "meta.json");

  await mkdir(snapshotDirectory, { recursive: true });
  await writeFile(snapshotPath, `${JSON.stringify(input.snapshot, null, 2)}\n`, "utf8");
  await writeFile(
    metaPath,
    `${JSON.stringify(
      {
        generatedAt: input.snapshot.generatedAt,
        operatorCount: input.snapshot.operatorCount,
        pendingOperatorCount: input.snapshot.pendingOperators.summary.operatorCount
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return {
    snapshotPath,
    metaPath
  };
}
