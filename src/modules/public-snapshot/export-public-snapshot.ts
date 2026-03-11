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
  pendingOperatorsPath: string;
  staticSnapshotPath: string;
  staticMetaPath: string;
  staticPendingOperatorsPath: string;
};

export async function writePublicSnapshotFiles(
  input: WritePublicSnapshotFilesInput
): Promise<WritePublicSnapshotFilesResult> {
  const snapshotDirectory = join(input.outputRoot, "netzentgelte");
  const staticSnapshotDirectory = join(input.outputRoot, "data", "netzentgelte");
  const snapshotPath = join(snapshotDirectory, "snapshot.json");
  const metaPath = join(snapshotDirectory, "meta.json");
  const pendingOperatorsPath = join(snapshotDirectory, "pending-operators.json");
  const staticSnapshotPath = join(staticSnapshotDirectory, "snapshot.json");
  const staticMetaPath = join(staticSnapshotDirectory, "meta.json");
  const staticPendingOperatorsPath = join(staticSnapshotDirectory, "pending-operators.json");
  const meta = {
    generatedAt: input.snapshot.generatedAt,
    operatorCount: input.snapshot.operatorCount,
    pendingOperatorCount: input.snapshot.pendingOperators.summary.operatorCount
  };

  await mkdir(snapshotDirectory, { recursive: true });
  await mkdir(staticSnapshotDirectory, { recursive: true });

  await Promise.all([
    writeFile(snapshotPath, `${JSON.stringify(input.snapshot, null, 2)}\n`, "utf8"),
    writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8"),
    writeFile(pendingOperatorsPath, `${JSON.stringify(input.snapshot.pendingOperators, null, 2)}\n`, "utf8"),
    writeFile(staticSnapshotPath, `${JSON.stringify(input.snapshot, null, 2)}\n`, "utf8"),
    writeFile(staticMetaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8"),
    writeFile(staticPendingOperatorsPath, `${JSON.stringify(input.snapshot.pendingOperators, null, 2)}\n`, "utf8")
  ]);

  return {
    snapshotPath,
    metaPath,
    pendingOperatorsPath,
    staticSnapshotPath,
    staticMetaPath,
    staticPendingOperatorsPath
  };
}
