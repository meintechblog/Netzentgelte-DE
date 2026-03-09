import { asc, sql } from "drizzle-orm";

import { getOperatorShellRegistry, type OperatorShellRegistryEntry } from "./shell-registry";

export type OperatorShell = OperatorShellRegistryEntry & {
  countryCode: string;
  lastCheckedAt: string | null;
};

export function getSeedOperatorShells(): OperatorShell[] {
  return getOperatorShellRegistry().map((entry) => ({
    ...entry,
    countryCode: "DE",
    lastCheckedAt: null
  }));
}

export function getShellCatalogStats(entries: OperatorShell[]) {
  return {
    operatorCount: entries.length,
    verifiedCount: entries.filter((entry) => entry.reviewStatus === "verified").length,
    exactCoverageCount: entries.filter((entry) => entry.coverageStatus === "exact").length,
    sourceFoundCount: entries.filter((entry) => entry.sourceStatus !== "missing").length
  };
}

export function shouldUseSeedOperatorShells(input: {
  nodeEnv: string | undefined;
  databaseUrl: string | undefined;
}) {
  return input.nodeEnv === "test" || !input.databaseUrl;
}

export async function loadOperatorShells() {
  if (
    shouldUseSeedOperatorShells({
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL
    })
  ) {
    return getSeedOperatorShells();
  }

  const { db } = await import("../../db/client");
  const { operatorShells } = await import("../../db/schema");

  const rows = await db
    .select({
      slug: operatorShells.slug,
      operatorName: operatorShells.operatorName,
      legalName: operatorShells.legalName,
      countryCode: operatorShells.countryCode,
      websiteUrl: operatorShells.websiteUrl,
      regionLabel: sql<string>`coalesce(${operatorShells.regionLabel}, '')`,
      shellStatus: operatorShells.shellStatus,
      coverageStatus: operatorShells.coverageStatus,
      sourceStatus: operatorShells.sourceStatus,
      tariffStatus: operatorShells.tariffStatus,
      reviewStatus: operatorShells.reviewStatus,
      mastrId: operatorShells.mastrId,
      sourcePageUrl: operatorShells.sourcePageUrl,
      documentUrl: operatorShells.documentUrl,
      notes: operatorShells.notes,
      lastCheckedAt: sql<string | null>`to_char(${operatorShells.lastCheckedAt}, 'YYYY-MM-DD')`
    })
    .from(operatorShells)
    .orderBy(asc(operatorShells.slug));

  return rows.map((row) => ({
    ...row,
    legalName: row.legalName ?? undefined,
    websiteUrl: row.websiteUrl ?? undefined,
    sourcePageUrl: row.sourcePageUrl ?? undefined,
    documentUrl: row.documentUrl ?? undefined,
    notes: row.notes ?? undefined
  })) as OperatorShell[];
}
