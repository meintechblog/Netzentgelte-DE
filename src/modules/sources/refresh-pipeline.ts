import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createSourceSnapshotFromFetch } from "./refresh-service";

export type RefreshableSource = {
  sourceCatalogId: string;
  sourceSlug: string;
  pageUrl: string;
  documentUrl: string;
};

export type SourceRefreshGateway = {
  insertSnapshot: (snapshot: Awaited<ReturnType<typeof createSourceSnapshotFromFetch>>) => Promise<unknown>;
  markSourceRefreshed: (input: {
    sourceCatalogId: string;
    checkedAt: Date;
    successfulAt: Date;
  }) => Promise<void>;
  insertRun: (input: {
    sourceCatalogId: string;
    runType: string;
    status: "success" | "failed";
    summary: {
      fetchedCount: number;
      snapshotCount: number;
    };
  }) => Promise<void>;
};

export async function refreshSources(input: {
  sources: RefreshableSource[];
  artifactRootDir: string;
  fetchedAt?: Date;
  fetchDocument: (source: RefreshableSource) => Promise<Response>;
  gateway: SourceRefreshGateway;
}) {
  let fetchedCount = 0;
  let snapshotCount = 0;

  for (const source of input.sources) {
    const snapshot = await createSourceSnapshotFromFetch({
      sourceCatalogId: source.sourceCatalogId,
      sourceSlug: source.sourceSlug,
      pageUrl: source.pageUrl,
      documentUrl: source.documentUrl,
      fetchDocument: () => input.fetchDocument(source),
      fetchedAt: input.fetchedAt
    });

    const artifactPath = path.join(input.artifactRootDir, snapshot.storagePath);

    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, snapshot.documentBuffer);
    await input.gateway.insertSnapshot(snapshot);
    await input.gateway.markSourceRefreshed({
      sourceCatalogId: source.sourceCatalogId,
      checkedAt: snapshot.fetchedAt,
      successfulAt: snapshot.fetchedAt
    });
    await input.gateway.insertRun({
      sourceCatalogId: source.sourceCatalogId,
      runType: "source-refresh",
      status: "success",
      summary: {
        fetchedCount: 1,
        snapshotCount: 1
      }
    });

    fetchedCount += 1;
    snapshotCount += 1;
  }

  return {
    fetchedCount,
    snapshotCount
  };
}
