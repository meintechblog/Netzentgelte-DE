import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { operators } from "./operators";
import { sourceCatalog } from "./sources";

export const ingestRuns = pgTable("ingest_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id").references(() => operators.id, { onDelete: "set null" }),
  sourceCatalogId: uuid("source_catalog_id").references(() => sourceCatalog.id, {
    onDelete: "set null"
  }),
  runType: text("run_type").notNull().default("manual"),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  summary: jsonb("summary").$type<Record<string, unknown>>().notNull().default({})
});
