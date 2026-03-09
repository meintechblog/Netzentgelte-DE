import "server-only";

import { parseDatabaseUrl } from "../db/connection-string";

export const env = {
  DATABASE_URL: parseDatabaseUrl(process.env.DATABASE_URL ?? "")
};
