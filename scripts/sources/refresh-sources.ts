import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { and, inArray, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDatabaseUrl } from "../../src/db/connection-string";
import { ingestRuns, sourceCatalog, sourceSnapshots } from "../../src/db/schema";
import { auditLiveSources } from "../../src/modules/sources/source-live-audit";
import { refreshSources } from "../../src/modules/sources/refresh-pipeline";
import { runSourceRefresh } from "../../src/modules/sources/refresh-runner";

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
    sourceCatalog,
    sourceSnapshots
  }
});

const cliArgs = process.argv.slice(2);
const sourceSlugs = parseSourceSlugs(cliArgs);
const mode = parseMode(cliArgs);
const artifactRootDir = path.resolve(directoryName, "../../data");

const summary = await runSourceRefresh({
  sourceSlugs,
  loadSources: async () => {
    const rows = await db
      .select({
        sourceCatalogId: sourceCatalog.id,
        sourceSlug: sourceCatalog.sourceSlug,
        pageUrl: sourceCatalog.pageUrl,
        documentUrl: sourceCatalog.sourceUrl
      })
      .from(sourceCatalog)
      .where(
        and(isNotNull(sourceCatalog.pageUrl), isNotNull(sourceCatalog.sourceUrl))
      );

    if (!sourceSlugs || sourceSlugs.length === 0) {
      return rows.map((row) => ({
        sourceCatalogId: row.sourceCatalogId,
        sourceSlug: row.sourceSlug,
        pageUrl: row.pageUrl ?? "",
        documentUrl: row.documentUrl
      }));
    }

    return rows
      .filter((row) => sourceSlugs.includes(row.sourceSlug))
      .map((row) => ({
        sourceCatalogId: row.sourceCatalogId,
        sourceSlug: row.sourceSlug,
        pageUrl: row.pageUrl ?? "",
        documentUrl: row.documentUrl
      }));
  },
  refreshBatch: async ({ sources }) =>
    (mode === "audit" ? auditLiveSources : refreshSources)({
      sources,
      artifactRootDir,
      fetchPage: async (source) => fetch(source.pageUrl),
      fetchDocument: async (source) => fetch(source.documentUrl),
      gateway: {
        insertSnapshot: async (snapshot) => {
          const { documentBuffer, ...persistedSnapshot } = snapshot;
          void documentBuffer;

          await db.insert(sourceSnapshots).values(persistedSnapshot);
        },
        markSourceRefreshed: async (input) => {
          await db
            .update(sourceCatalog)
            .set({
              lastCheckedAt: input.checkedAt,
              lastSuccessfulAt: input.successfulAt
            })
            .where(inArray(sourceCatalog.id, [input.sourceCatalogId]));
        },
        insertRun: async (input) => {
          await db.insert(ingestRuns).values({
            sourceCatalogId: input.sourceCatalogId,
            runType: input.runType,
            status: input.status,
            completedAt: new Date(),
            summary: input.summary
          });
        }
      }
    })
});

console.log(
  JSON.stringify(
    {
      status: "ok",
      mode,
      summary
    },
    null,
    2
  )
);

await sqlClient.end();

function parseSourceSlugs(argv: string[]) {
  const result: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (!argument) {
      continue;
    }

    if (argument.startsWith("--source-slug=")) {
      result.push(argument.slice("--source-slug=".length));
      continue;
    }

    if (argument === "--source-slug") {
      const value = argv[index + 1];

      if (value) {
        result.push(value);
        index += 1;
      }
    }
  }

  return result;
}

function parseMode(argv: string[]) {
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (!argument) {
      continue;
    }

    if (argument.startsWith("--mode=")) {
      return normalizeMode(argument.slice("--mode=".length));
    }

    if (argument === "--mode") {
      return normalizeMode(argv[index + 1]);
    }
  }

  return "refresh";
}

function normalizeMode(value: string | undefined) {
  return value === "audit" ? "audit" : "refresh";
}
