import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const operatorShells = pgTable("operator_shells", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  operatorName: text("operator_name").notNull(),
  legalName: text("legal_name"),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("DE"),
  websiteUrl: text("website_url"),
  regionLabel: text("region_label"),
  shellStatus: text("shell_status").notNull().default("shell"),
  coverageStatus: text("coverage_status").notNull().default("unknown"),
  sourceStatus: text("source_status").notNull().default("missing"),
  tariffStatus: text("tariff_status").notNull().default("missing"),
  reviewStatus: text("review_status").notNull().default("pending"),
  registryFeedSource: text("registry_feed_source"),
  registryFeedLabel: text("registry_feed_label"),
  lastSeenInRegistryFeed: text("last_seen_in_registry_feed"),
  deprecatedStatus: text("deprecated_status").notNull().default("active"),
  deprecatedCheckedAt: text("deprecated_checked_at"),
  deprecatedReason: text("deprecated_reason"),
  mastrId: text("mastr_id"),
  sourcePageUrl: text("source_page_url"),
  documentUrl: text("document_url"),
  notes: text("notes"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
