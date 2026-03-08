import { defineConfig } from "drizzle-kit";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://netzentgelte_app:netzentgelte_dev@127.0.0.1:5432/netzentgelte";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString
  }
});
