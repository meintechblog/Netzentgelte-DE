import { date, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { operators } from "./operators";
import { sourceCatalog, sourceSnapshots } from "./sources";

export const tariffProducts = pgTable("tariff_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id, { onDelete: "cascade" }),
  sourceCatalogId: uuid("source_catalog_id").references(() => sourceCatalog.id, {
    onDelete: "set null"
  }),
  sourceSnapshotId: uuid("source_snapshot_id").references(() => sourceSnapshots.id, {
    onDelete: "set null"
  }),
  networkLevel: text("network_level").notNull(),
  moduleKey: text("module_key").notNull(),
  meteringMode: text("metering_mode").notNull(),
  validFrom: date("valid_from").notNull(),
  validUntil: date("valid_until"),
  humanReviewStatus: text("human_review_status").notNull().default("pending"),
  sourceQuote: text("source_quote"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const tariffComponents = pgTable("tariff_components", {
  id: uuid("id").defaultRandom().primaryKey(),
  tariffProductId: uuid("tariff_product_id")
    .notNull()
    .references(() => tariffProducts.id, { onDelete: "cascade" }),
  componentKey: text("component_key").notNull(),
  valueNumeric: numeric("value_numeric", { precision: 12, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  rawLabel: text("raw_label"),
  sourceQuote: text("source_quote"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const tariffMeteringPrices = pgTable("tariff_metering_prices", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id, { onDelete: "cascade" }),
  sourceCatalogId: uuid("source_catalog_id").references(() => sourceCatalog.id, {
    onDelete: "set null"
  }),
  validFrom: date("valid_from").notNull(),
  validUntil: date("valid_until"),
  componentKey: text("component_key").notNull(),
  valueNumeric: numeric("value_numeric", { precision: 12, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  sourceQuote: text("source_quote"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const tariffRequirements = pgTable("tariff_requirements", {
  id: uuid("id").defaultRandom().primaryKey(),
  tariffProductId: uuid("tariff_product_id")
    .notNull()
    .references(() => tariffProducts.id, { onDelete: "cascade" }),
  requirementKey: text("requirement_key").notNull(),
  requirementValue: text("requirement_value").notNull(),
  sourceQuote: text("source_quote"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const tariffTimeWindows = pgTable("tariff_time_windows", {
  id: uuid("id").defaultRandom().primaryKey(),
  tariffProductId: uuid("tariff_product_id")
    .notNull()
    .references(() => tariffProducts.id, { onDelete: "cascade" }),
  quarterKey: text("quarter_key").notNull(),
  bandKey: text("band_key").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  daysRule: text("days_rule"),
  sourceQuote: text("source_quote"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
