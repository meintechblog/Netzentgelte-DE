import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createSourceSnapshotFromFetch } from "./refresh-service";
import type { RefreshableSource, SourceRefreshGateway } from "./refresh-pipeline";

export type SourceLiveAuditStatus = "ok" | "warning" | "blocked";

export type SourceLiveAuditIssue = {
  key: "access_blocked" | "unexpected_content_type" | "fetch_failed";
  message: string;
};

export type SourceLiveAuditResult = {
  sourceCatalogId: string;
  sourceSlug: string;
  status: SourceLiveAuditStatus;
  issues: SourceLiveAuditIssue[];
  snapshotCount: number;
  page: {
    statusCode: number;
    finalUrl: string;
    contentType: string | null;
  } | null;
  document: {
    statusCode: number;
    finalUrl: string;
    contentType: string | null;
  } | null;
};

export async function auditLiveSources(input: {
  sources: RefreshableSource[];
  artifactRootDir: string;
  fetchedAt?: Date;
  fetchPage: (source: RefreshableSource) => Promise<Response>;
  fetchDocument: (source: RefreshableSource) => Promise<Response>;
  gateway: SourceRefreshGateway;
}) {
  const results: SourceLiveAuditResult[] = [];
  let fetchedCount = 0;
  let snapshotCount = 0;

  for (const source of input.sources) {
    try {
      const pageResponse = await input.fetchPage(source);
      const documentResponse = await input.fetchDocument(source);
      const pageMeta = buildResponseMeta(pageResponse, source.pageUrl);
      const documentMeta = buildResponseMeta(documentResponse, source.documentUrl);

      if (isBlocked(pageResponse) || isBlocked(documentResponse)) {
        const result: SourceLiveAuditResult = {
          sourceCatalogId: source.sourceCatalogId,
          sourceSlug: source.sourceSlug,
          status: "blocked",
          issues: [
            {
              key: "access_blocked",
              message: "Page oder Dokument wurde durch den Betreiber technisch blockiert."
            }
          ],
          snapshotCount: 0,
          page: pageMeta,
          document: documentMeta
        };
        results.push(result);
        await input.gateway.insertRun({
          sourceCatalogId: source.sourceCatalogId,
          runType: "source-live-audit",
          status: "failed",
          summary: {
            fetchedCount: 0,
            snapshotCount: 0
          }
        });
        continue;
      }

      if (!isSupportedDocumentResponse(documentResponse)) {
        const result: SourceLiveAuditResult = {
          sourceCatalogId: source.sourceCatalogId,
          sourceSlug: source.sourceSlug,
          status: "warning",
          issues: [
            {
              key: "unexpected_content_type",
              message: "Das Dokument antwortet nicht mit einem erwarteten Artefakt-Content-Type."
            }
          ],
          snapshotCount: 0,
          page: pageMeta,
          document: documentMeta
        };
        results.push(result);
        await input.gateway.insertRun({
          sourceCatalogId: source.sourceCatalogId,
          runType: "source-live-audit",
          status: "failed",
          summary: {
            fetchedCount: 0,
            snapshotCount: 0
          }
        });
        continue;
      }

      const pageSnapshot = await createSourceSnapshotFromFetch({
        sourceCatalogId: source.sourceCatalogId,
        sourceSlug: source.sourceSlug,
        pageUrl: source.pageUrl,
        artifactKind: "page",
        artifactUrl: pageMeta.finalUrl,
        fetchArtifact: async () => pageResponse.clone(),
        fetchedAt: input.fetchedAt
      });
      const documentSnapshot = await createSourceSnapshotFromFetch({
        sourceCatalogId: source.sourceCatalogId,
        sourceSlug: source.sourceSlug,
        pageUrl: source.pageUrl,
        artifactKind: "document",
        artifactUrl: documentMeta.finalUrl,
        fetchArtifact: async () => documentResponse.clone(),
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
        runType: "source-live-audit",
        status: "success",
        summary: {
          fetchedCount: 1,
          snapshotCount: 2
        }
      });

      fetchedCount += 1;
      snapshotCount += 2;
      results.push({
        sourceCatalogId: source.sourceCatalogId,
        sourceSlug: source.sourceSlug,
        status: "ok",
        issues: [],
        snapshotCount: 2,
        page: pageMeta,
        document: documentMeta
      });
    } catch (error) {
      results.push({
        sourceCatalogId: source.sourceCatalogId,
        sourceSlug: source.sourceSlug,
        status: "blocked",
        issues: [
          {
            key: "fetch_failed",
            message: error instanceof Error ? error.message : "Fetch fehlgeschlagen."
          }
        ],
        snapshotCount: 0,
        page: null,
        document: null
      });
      await input.gateway.insertRun({
        sourceCatalogId: source.sourceCatalogId,
        runType: "source-live-audit",
        status: "failed",
        summary: {
          fetchedCount: 0,
          snapshotCount: 0
        }
      });
    }
  }

  return {
    fetchedCount,
    snapshotCount,
    results
  };
}

function buildResponseMeta(response: Response, fallbackUrl: string) {
  return {
    statusCode: response.status,
    finalUrl: response.url || fallbackUrl,
    contentType: response.headers.get("content-type")
  };
}

function isBlocked(response: Response) {
  return response.status === 401 || response.status === 403;
}

function isSupportedDocumentResponse(response: Response) {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  return (
    contentType.includes("application/pdf") ||
    contentType.includes("application/vnd") ||
    contentType.includes("text/csv") ||
    contentType.includes("application/json")
  );
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
