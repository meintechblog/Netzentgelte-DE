import { desc, eq, inArray, sql } from "drizzle-orm";

import { withBasePath } from "../../lib/base-path";
import { getOperatorRegistry } from "../operators/registry";
import { buildSourceHealthReport, type SourceHealthReport } from "./source-health";

export type CurrentSource = {
  sourceCatalogId: string;
  sourceSlug: string;
  operatorSlug: string;
  operatorName: string;
  pageUrl: string;
  documentUrl: string;
  reviewStatus: string;
  checkedAt: string | null;
  lastSuccessfulAt: string | null;
  latestPageSnapshotFetchedAt: string | null;
  latestPageSnapshotHash: string | null;
  latestPageSnapshotStoragePath: string | null;
  pageArtifactApiUrl: string | null;
  latestDocumentSnapshotFetchedAt: string | null;
  latestDocumentSnapshotHash: string | null;
  latestDocumentSnapshotStoragePath: string | null;
  documentArtifactApiUrl: string | null;
  healthReport: SourceHealthReport;
};

export type CurrentSourceRow = Omit<
  CurrentSource,
  "pageArtifactApiUrl" | "documentArtifactApiUrl" | "healthReport"
>;

export function buildCurrentSources(rows: CurrentSourceRow[]): CurrentSource[] {
  return rows.map((row) => ({
    ...row,
    pageArtifactApiUrl: buildArtifactApiUrl(row.latestPageSnapshotStoragePath),
    documentArtifactApiUrl: buildArtifactApiUrl(row.latestDocumentSnapshotStoragePath),
    healthReport: buildSourceHealthReport({
      reviewStatus: row.reviewStatus,
      pageUrl: row.pageUrl,
      documentUrl: row.documentUrl,
      checkedAt: row.checkedAt,
      latestPageSnapshotStoragePath: row.latestPageSnapshotStoragePath,
      latestDocumentSnapshotStoragePath: row.latestDocumentSnapshotStoragePath
    })
  }));
}

export function getSeedCurrentSources(): CurrentSource[] {
  return getOperatorRegistry().map<CurrentSource>((entry) => {
    const sourceDocument = entry.sourceDocuments.find(
      (document) => document.id === entry.currentTariff.sourceDocumentId
    );

    if (!sourceDocument) {
      throw new Error(`Missing current source document for ${entry.slug}.`);
    }

    return {
      sourceCatalogId: `${entry.slug}-seed`,
      sourceSlug: `${entry.slug}-${sourceDocument.id}`,
      operatorSlug: entry.slug,
      operatorName: entry.name,
      pageUrl: sourceDocument.sourcePageUrl,
      documentUrl: sourceDocument.documentUrl,
      reviewStatus: sourceDocument.reviewStatus,
      checkedAt: sourceDocument.checkedAt,
      lastSuccessfulAt: sourceDocument.checkedAt,
      latestPageSnapshotFetchedAt: null,
      latestPageSnapshotHash: null,
      latestPageSnapshotStoragePath: null,
      pageArtifactApiUrl: null,
      latestDocumentSnapshotFetchedAt: null,
      latestDocumentSnapshotHash: null,
      latestDocumentSnapshotStoragePath: null,
      documentArtifactApiUrl: null,
      healthReport: buildSourceHealthReport({
        reviewStatus: sourceDocument.reviewStatus,
        pageUrl: sourceDocument.sourcePageUrl,
        documentUrl: sourceDocument.documentUrl,
        checkedAt: sourceDocument.checkedAt,
        summaryFallback: entry.currentTariff.summaryFallback ?? null,
        sourceNotes: sourceDocument.notes
      })
    };
  });
}

export function shouldUseSeedCurrentSources(input: {
  nodeEnv: string | undefined;
  databaseUrl: string | undefined;
}) {
  return input.nodeEnv === "test" || !input.databaseUrl;
}

export async function loadCurrentSources() {
  if (
    shouldUseSeedCurrentSources({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL
    })
  ) {
    return getSeedCurrentSources();
  }

  const { db } = await import("../../db/client");
  const { operators, sourceCatalog, sourceSnapshots } = await import("../../db/schema");

  const sourceRows = await db
    .select({
      sourceCatalogId: sourceCatalog.id,
      sourceSlug: sourceCatalog.sourceSlug,
      operatorSlug: operators.slug,
      operatorName: operators.name,
      pageUrl: sql<string>`coalesce(${sourceCatalog.pageUrl}, '')`,
      documentUrl: sourceCatalog.sourceUrl,
      reviewStatus: sourceCatalog.reviewStatus,
      checkedAt: sourceCatalog.lastCheckedAt,
      lastSuccessfulAt: sourceCatalog.lastSuccessfulAt
    })
    .from(sourceCatalog)
    .innerJoin(operators, eq(sourceCatalog.operatorId, operators.id))
    .orderBy(sourceCatalog.sourceSlug);

  const sourceIds = sourceRows.map((row) => row.sourceCatalogId);

  const snapshotRows =
    sourceIds.length === 0
      ? []
      : await db
          .select({
            sourceCatalogId: sourceSnapshots.sourceCatalogId,
            artifactKind: sourceSnapshots.artifactKind,
            fetchedAt: sourceSnapshots.fetchedAt,
            contentHash: sourceSnapshots.contentHash,
            storagePath: sourceSnapshots.storagePath
          })
          .from(sourceSnapshots)
          .where(inArray(sourceSnapshots.sourceCatalogId, sourceIds))
          .orderBy(sourceSnapshots.sourceCatalogId, desc(sourceSnapshots.fetchedAt));

  const latestSnapshotsBySourceCatalogId = new Map<
    string,
    {
      page?: {
        fetchedAt: Date | null;
        contentHash: string;
        storagePath: string | null;
      };
      document?: {
        fetchedAt: Date | null;
        contentHash: string;
        storagePath: string | null;
      };
    }
  >();

  for (const snapshot of snapshotRows) {
    const existing = latestSnapshotsBySourceCatalogId.get(snapshot.sourceCatalogId) ?? {};

    if (snapshot.artifactKind === "page") {
      if (!existing.page) {
        existing.page = snapshot;
      }
    } else if (!existing.document) {
      existing.document = snapshot;
    }

    latestSnapshotsBySourceCatalogId.set(snapshot.sourceCatalogId, existing);
  }

  return buildCurrentSources(
    sourceRows.map((row) => {
      const latestSnapshots = latestSnapshotsBySourceCatalogId.get(row.sourceCatalogId);

      return {
        sourceCatalogId: row.sourceCatalogId,
        sourceSlug: row.sourceSlug,
        operatorSlug: row.operatorSlug,
        operatorName: row.operatorName,
        pageUrl: row.pageUrl,
        documentUrl: row.documentUrl,
        reviewStatus: row.reviewStatus,
        checkedAt: row.checkedAt ? row.checkedAt.toISOString().slice(0, 10) : null,
        lastSuccessfulAt: row.lastSuccessfulAt ? row.lastSuccessfulAt.toISOString().slice(0, 10) : null,
        latestPageSnapshotFetchedAt: latestSnapshots?.page?.fetchedAt?.toISOString() ?? null,
        latestPageSnapshotHash: latestSnapshots?.page?.contentHash ?? null,
        latestPageSnapshotStoragePath: latestSnapshots?.page?.storagePath ?? null,
        latestDocumentSnapshotFetchedAt: latestSnapshots?.document?.fetchedAt?.toISOString() ?? null,
        latestDocumentSnapshotHash: latestSnapshots?.document?.contentHash ?? null,
        latestDocumentSnapshotStoragePath: latestSnapshots?.document?.storagePath ?? null
      };
    })
  );
}

function buildArtifactApiUrl(storagePath: string | null) {
  if (!storagePath) {
    return null;
  }

  const normalizedStoragePath = storagePath.replace(/^artifacts\//, "");

  return withBasePath(
    `/api/artifacts/${normalizedStoragePath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/")}`
  );
}
