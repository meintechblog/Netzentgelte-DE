import { readFileSync } from "node:fs";
import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDatabaseUrl } from "./connection-string";
import * as schema from "./schema";

export function resolveCliDatabaseUrl(input: {
  processEnv: Record<string, string | undefined>;
  envFileContents?: string;
}) {
  return resolveDatabaseUrl(input);
}

export function createCliDb(input?: {
  processEnv?: Record<string, string | undefined>;
  envFilePath?: string;
}) {
  const envFilePath = input?.envFilePath ?? path.resolve(process.cwd(), ".env");
  const envFileContents = readFileSync(envFilePath, "utf8");
  const connectionString = resolveCliDatabaseUrl({
    processEnv: input?.processEnv ?? process.env,
    envFileContents
  });
  const sql = postgres(connectionString, {
    prepare: false
  });

  return {
    db: drizzle(sql, { schema }),
    sql
  };
}
