import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { operators } from "./operators";

export const sourceCatalog = pgTable("source_catalog", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id, { onDelete: "cascade" }),
  sourceSlug: text("source_slug").notNull().unique(),
  sourceUrl: text("source_url").notNull(),
  documentType: text("document_type").notNull(),
  providerHint: text("provider_hint"),
  updateStrategy: text("update_strategy").notNull(),
  refreshWindowDays: integer("refresh_window_days").notNull().default(90),
  parserMode: text("parser_mode").notNull().default("pending"),
  reviewStatus: text("review_status").notNull().default("unverified"),
  notes: text("notes"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  lastSuccessfulAt: timestamp("last_successful_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const sourceSnapshots = pgTable("source_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceCatalogId: uuid("source_catalog_id")
    .notNull()
    .references(() => sourceCatalog.id, { onDelete: "cascade" }),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  pageUrl: text("page_url"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  mimeType: text("mime_type"),
  contentHash: text("content_hash").notNull(),
  storagePath: text("storage_path"),
  parserStatus: text("parser_status").notNull().default("pending"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({})
});
