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
  fetchPage: (source: RefreshableSource) => Promise<Response>;
  fetchDocument: (source: RefreshableSource) => Promise<Response>;
  gateway: SourceRefreshGateway;
}) {
  let fetchedCount = 0;
  let snapshotCount = 0;

  for (const source of input.sources) {
    const pageSnapshot = await createSourceSnapshotFromFetch({
      sourceCatalogId: source.sourceCatalogId,
      sourceSlug: source.sourceSlug,
      pageUrl: source.pageUrl,
      artifactKind: "page",
      artifactUrl: source.pageUrl,
      fetchArtifact: () => input.fetchPage(source),
      fetchedAt: input.fetchedAt
    });
    const documentSnapshot = await createSourceSnapshotFromFetch({
      sourceCatalogId: source.sourceCatalogId,
      sourceSlug: source.sourceSlug,
      pageUrl: source.pageUrl,
      artifactKind: "document",
      artifactUrl: source.documentUrl,
      fetchArtifact: () => input.fetchDocument(source),
      fetchedAt: input.fetchedAt
    });

    await persistSnapshotArtifact({
      artifactRootDir: input.artifactRootDir,
      gateway: input.gateway,
      snapshot: pageSnapshot
    });
    await persistSnapshotArtifact({
      artifactRootDir: input.artifactRootDir,
      gateway: input.gateway,
      snapshot: documentSnapshot
    });
    await input.gateway.markSourceRefreshed({
      sourceCatalogId: source.sourceCatalogId,
      checkedAt: documentSnapshot.fetchedAt,
      successfulAt: documentSnapshot.fetchedAt
    });
    await input.gateway.insertRun({
      sourceCatalogId: source.sourceCatalogId,
      runType: "source-refresh",
      status: "success",
      summary: {
        fetchedCount: 1,
        snapshotCount: 2
      }
    });

    fetchedCount += 1;
    snapshotCount += 2;
  }

  return {
    fetchedCount,
    snapshotCount
  };
}

async function persistSnapshotArtifact(input: {
  artifactRootDir: string;
  gateway: SourceRefreshGateway;
  snapshot: Awaited<ReturnType<typeof createSourceSnapshotFromFetch>>;
}) {
  const artifactPath = path.join(input.artifactRootDir, input.snapshot.storagePath);

  await mkdir(path.dirname(artifactPath), { recursive: true });
  await writeFile(artifactPath, input.snapshot.documentBuffer);
  await input.gateway.insertSnapshot(input.snapshot);
}
