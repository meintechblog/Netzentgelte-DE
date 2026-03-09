import { z } from "zod";

const databaseUrlSchema = z
  .string()
  .min(1)
  .refine(
    (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
    "DATABASE_URL must be a postgres connection string"
  );

export function parseDatabaseUrl(value: string) {
  return databaseUrlSchema.parse(value);
}

export function resolveDatabaseUrl(input: {
  processEnv: Record<string, string | undefined>;
  envFileContents?: string;
}) {
  const envLine = input.envFileContents
    ?.split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("DATABASE_URL="));

  const connectionString = input.processEnv.DATABASE_URL ?? envLine?.slice("DATABASE_URL=".length);

  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  return parseDatabaseUrl(connectionString);
}
