import { desc, eq, inArray, sql } from "drizzle-orm";

import { getOperatorRegistry } from "../operators/registry";

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
  latestSnapshotFetchedAt: string | null;
  latestSnapshotHash: string | null;
  latestSnapshotStoragePath: string | null;
  artifactApiUrl: string | null;
};

export type CurrentSourceRow = Omit<CurrentSource, "artifactApiUrl">;

export function buildCurrentSources(rows: CurrentSourceRow[]): CurrentSource[] {
  return rows.map((row) => ({
    ...row,
    artifactApiUrl: buildArtifactApiUrl(row.latestSnapshotStoragePath)
  }));
}

export function getSeedCurrentSources(): CurrentSource[] {
  return getOperatorRegistry().map((entry) => {
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
      latestSnapshotFetchedAt: null,
      latestSnapshotHash: null,
      latestSnapshotStoragePath: null,
      artifactApiUrl: null
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
            fetchedAt: sourceSnapshots.fetchedAt,
            contentHash: sourceSnapshots.contentHash,
            storagePath: sourceSnapshots.storagePath
          })
          .from(sourceSnapshots)
          .where(inArray(sourceSnapshots.sourceCatalogId, sourceIds))
          .orderBy(sourceSnapshots.sourceCatalogId, desc(sourceSnapshots.fetchedAt));

  const latestSnapshotBySourceCatalogId = new Map<
    string,
    {
      fetchedAt: Date | null;
      contentHash: string;
      storagePath: string | null;
    }
  >();

  for (const snapshot of snapshotRows) {
    if (latestSnapshotBySourceCatalogId.has(snapshot.sourceCatalogId)) {
      continue;
    }

    latestSnapshotBySourceCatalogId.set(snapshot.sourceCatalogId, snapshot);
  }

  return buildCurrentSources(
    sourceRows.map((row) => {
      const latestSnapshot = latestSnapshotBySourceCatalogId.get(row.sourceCatalogId);

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
        latestSnapshotFetchedAt: latestSnapshot?.fetchedAt?.toISOString() ?? null,
        latestSnapshotHash: latestSnapshot?.contentHash ?? null,
        latestSnapshotStoragePath: latestSnapshot?.storagePath ?? null
      };
    })
  );
}

function buildArtifactApiUrl(storagePath: string | null) {
  if (!storagePath) {
    return null;
  }

  const normalizedStoragePath = storagePath.replace(/^artifacts\//, "");

  return `/api/artifacts/${normalizedStoragePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}
