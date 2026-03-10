import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { parsePublicSnapshot, type PublicSnapshot } from "../modules/public-snapshot/schema";

export type LoadPublicSnapshotFromDiskInput = {
  cwd?: string;
};

export async function loadPublicSnapshotFromDisk(
  input: LoadPublicSnapshotFromDiskInput = {}
): Promise<PublicSnapshot | null> {
  const cwd = input.cwd ?? process.cwd();
  const snapshotPath = join(cwd, "public", "netzentgelte", "snapshot.json");

  try {
    const rawSnapshot = await readFile(snapshotPath, "utf8");
    return parsePublicSnapshot(JSON.parse(rawSnapshot));
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code?: unknown }).code === "string" &&
      (error as { code: string }).code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}
