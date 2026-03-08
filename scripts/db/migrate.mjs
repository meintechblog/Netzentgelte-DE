import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import postgres from "postgres";

const directoryName = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(directoryName, "../../drizzle");
const envFilePath = path.resolve(directoryName, "../../.env");

const envFileContents = await readFile(envFilePath, "utf8").catch(() => "");
const envLine = envFileContents
  .split("\n")
  .map((line) => line.trim())
  .find((line) => line.startsWith("DATABASE_URL="));

const connectionString = process.env.DATABASE_URL ?? envLine?.slice("DATABASE_URL=".length);

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

const sql = postgres(connectionString, {
  prepare: false
});

try {
  const entries = await readdir(migrationsDirectory);
  const migrationFiles = entries.filter((entry) => entry.endsWith(".sql")).sort();

  for (const migrationFile of migrationFiles) {
    const migrationPath = path.join(migrationsDirectory, migrationFile);
    const contents = await readFile(migrationPath, "utf8");

    await sql.unsafe(contents);
  }
} finally {
  await sql.end();
}
