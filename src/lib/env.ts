import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith("postgres://"))
});

export const env = envSchema.parse({
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/netzentgelte"
});
