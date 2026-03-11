import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDatabaseUrl } from "../../src/db/connection-string";
import { ingestRuns, operators, sourceCatalog, tariffVersions } from "../../src/db/schema";
import { buildRegistryImportPayload } from "../../src/modules/operators/registry-import";
import { type RegistryPersistenceGateway, persistRegistryImport } from "../../src/modules/operators/registry-persist";
import { getOperatorRegistry } from "../../src/modules/operators/registry";

const directoryName = path.dirname(fileURLToPath(import.meta.url));
const envFilePath = path.resolve(directoryName, "../../.env");
const envFileContents = await readFile(envFilePath, "utf8").catch(() => "");
const connectionString = resolveDatabaseUrl({
  processEnv: process.env,
  envFileContents
});
const sqlClient = postgres(connectionString, {
  prepare: false
});
const db = drizzle(sqlClient, {
  schema: {
    ingestRuns,
    operators,
    sourceCatalog,
    tariffVersions
  }
});

const registry = getOperatorRegistry();
const payload = buildRegistryImportPayload(registry);

const gateway: RegistryPersistenceGateway = {
  async upsertOperators(rows) {
    await db
      .insert(operators)
      .values(
        rows.map((row) => ({
          slug: row.slug,
          name: row.name,
          countryCode: row.countryCode,
          regionLabel: row.regionLabel,
          websiteUrl: row.websiteUrl
        }))
      )
      .onConflictDoUpdate({
        target: operators.slug,
        set: {
          name: sql.raw(`excluded.${operators.name.name}`),
          countryCode: sql.raw(`excluded.${operators.countryCode.name}`),
          regionLabel: sql.raw(`excluded.${operators.regionLabel.name}`),
          websiteUrl: sql.raw(`excluded.${operators.websiteUrl.name}`),
          updatedAt: new Date()
        }
      });
  },

  async upsertSources(rows) {
    const operatorMap = await loadOperatorIds(rows.map((row) => row.operatorSlug));

    await db
      .insert(sourceCatalog)
      .values(
        rows.map((row) => ({
          operatorId: requireOperatorId(operatorMap, row.operatorSlug),
          sourceSlug: row.sourceSlug,
          pageUrl: row.pageUrl,
          sourceUrl: row.sourceUrl,
          documentType: row.documentType,
          providerHint: row.providerHint,
          updateStrategy: row.updateStrategy,
          refreshWindowDays: row.refreshWindowDays,
          parserMode: row.parserMode,
          reviewStatus: row.reviewStatus,
          notes: row.notes,
          lastCheckedAt: new Date(row.lastCheckedAt)
        }))
      )
      .onConflictDoUpdate({
        target: sourceCatalog.sourceSlug,
        set: {
          pageUrl: sql.raw(`excluded.${sourceCatalog.pageUrl.name}`),
          sourceUrl: sql.raw(`excluded.${sourceCatalog.sourceUrl.name}`),
          documentType: sql.raw(`excluded.${sourceCatalog.documentType.name}`),
          providerHint: sql.raw(`excluded.${sourceCatalog.providerHint.name}`),
          updateStrategy: sql.raw(`excluded.${sourceCatalog.updateStrategy.name}`),
          refreshWindowDays: sql.raw(`excluded.${sourceCatalog.refreshWindowDays.name}`),
          parserMode: sql.raw(`excluded.${sourceCatalog.parserMode.name}`),
          reviewStatus: sql.raw(`excluded.${sourceCatalog.reviewStatus.name}`),
          notes: sql.raw(`excluded.${sourceCatalog.notes.name}`),
          lastCheckedAt: sql.raw(`excluded.${sourceCatalog.lastCheckedAt.name}`)
        }
      });
  },

  async replaceTariffs(rows) {
    const operatorMap = await loadOperatorIds(rows.map((row) => row.operatorSlug));
    const validFroms = [...new Set(rows.map((row) => row.validFrom))];
    const operatorIds = [
      ...new Set(rows.map((row) => requireOperatorId(operatorMap, row.operatorSlug)))
    ];

    if (operatorIds.length > 0) {
      await db
        .delete(tariffVersions)
        .where(
          and(
            inArray(tariffVersions.operatorId, operatorIds),
            eq(tariffVersions.modelKey, "14a-model-3"),
            inArray(tariffVersions.validFrom, validFroms),
            isNull(tariffVersions.sourceSnapshotId)
          )
        );
    }

    await db.insert(tariffVersions).values(
      rows.map((row) => ({
        operatorId: requireOperatorId(operatorMap, row.operatorSlug),
        modelKey: row.modelKey,
        bandKey: row.bandKey,
        validFrom: row.validFrom,
        normalizationStatus: "curated-registry",
        rawLabel: row.rawLabel,
        rawValue: row.rawValue,
        sourcePageUrl: row.sourcePageUrl,
        sourceQuote: row.sourceQuote,
        confidenceScore: "1.00",
        humanReviewStatus: row.humanReviewStatus,
        humanReviewNotes: "Imported from curated registry seed.",
        valueCtPerKwh: row.valueCtPerKwh
      }))
    );
  },

  async insertRun(input) {
    await db.insert(ingestRuns).values({
      runType: input.runType,
      status: input.status,
      completedAt: new Date(),
      summary: input.summary
    });
  }
};

const summary = await persistRegistryImport({
  gateway,
  payload,
  runType: "registry-import"
});

console.log(
  JSON.stringify(
    {
      status: "ok",
      summary
    },
    null,
    2
  )
);

await sqlClient.end();

async function loadOperatorIds(slugs: string[]) {
  const uniqueSlugs = [...new Set(slugs)];
  const rows = await db
    .select({
      id: operators.id,
      slug: operators.slug
    })
    .from(operators)
    .where(inArray(operators.slug, uniqueSlugs));

  return new Map(rows.map((row) => [row.slug, row.id]));
}

function requireOperatorId(operatorMap: Map<string, string>, slug: string) {
  const operatorId = operatorMap.get(slug);

  if (!operatorId) {
    throw new Error(`Missing operator id for ${slug}.`);
  }

  return operatorId;
}
