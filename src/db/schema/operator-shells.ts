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
  mastrId: text("mastr_id"),
  sourcePageUrl: text("source_page_url"),
  documentUrl: text("document_url"),
  notes: text("notes"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
