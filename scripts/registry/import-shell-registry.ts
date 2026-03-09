import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDatabaseUrl } from "../../src/db/connection-string";
import { ingestRuns, operatorShells } from "../../src/db/schema";
import { buildShellImportPayload } from "../../src/modules/operators/shell-import";
import { type ShellPersistenceGateway, persistShellImport } from "../../src/modules/operators/shell-persist";
import { getOperatorShellRegistry } from "../../src/modules/operators/shell-registry";

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
    operatorShells
  }
});

const payload = buildShellImportPayload(getOperatorShellRegistry());

const gateway: ShellPersistenceGateway = {
  async replaceShells(rows) {
    await db
      .insert(operatorShells)
      .values(
        rows.map((row) => ({
          slug: row.slug,
          operatorName: row.operatorName,
          legalName: row.legalName,
          countryCode: row.countryCode,
          websiteUrl: row.websiteUrl,
          regionLabel: row.regionLabel,
          shellStatus: row.shellStatus,
          coverageStatus: row.coverageStatus,
          sourceStatus: row.sourceStatus,
          tariffStatus: row.tariffStatus,
          reviewStatus: row.reviewStatus,
          mastrId: row.mastrId,
          sourcePageUrl: row.sourcePageUrl,
          documentUrl: row.documentUrl,
          notes: row.notes,
          lastCheckedAt: row.lastCheckedAt ? new Date(row.lastCheckedAt) : null
        }))
      )
      .onConflictDoUpdate({
        target: operatorShells.slug,
        set: {
          operatorName: sql.raw(`excluded.${operatorShells.operatorName.name}`),
          legalName: sql.raw(`excluded.${operatorShells.legalName.name}`),
          countryCode: sql.raw(`excluded.${operatorShells.countryCode.name}`),
          websiteUrl: sql.raw(`excluded.${operatorShells.websiteUrl.name}`),
          regionLabel: sql.raw(`excluded.${operatorShells.regionLabel.name}`),
          shellStatus: sql.raw(`excluded.${operatorShells.shellStatus.name}`),
          coverageStatus: sql.raw(`excluded.${operatorShells.coverageStatus.name}`),
          sourceStatus: sql.raw(`excluded.${operatorShells.sourceStatus.name}`),
          tariffStatus: sql.raw(`excluded.${operatorShells.tariffStatus.name}`),
          reviewStatus: sql.raw(`excluded.${operatorShells.reviewStatus.name}`),
          mastrId: sql.raw(`excluded.${operatorShells.mastrId.name}`),
          sourcePageUrl: sql.raw(`excluded.${operatorShells.sourcePageUrl.name}`),
          documentUrl: sql.raw(`excluded.${operatorShells.documentUrl.name}`),
          notes: sql.raw(`excluded.${operatorShells.notes.name}`),
          lastCheckedAt: sql.raw(`excluded.${operatorShells.lastCheckedAt.name}`),
          updatedAt: new Date()
        }
      });
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

const summary = await persistShellImport({
  gateway,
  payload,
  runType: "shell-registry-import"
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
