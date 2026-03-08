import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .refine(
      (value) => value.startsWith("postgres://") || value.startsWith("postgresql://"),
      "DATABASE_URL must be a postgres connection string"
    )
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL
});
