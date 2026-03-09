import { date, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { operators } from "./operators";
import { sourceSnapshots } from "./sources";

export const tariffVersions = pgTable("tariff_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id, { onDelete: "cascade" }),
  sourceSnapshotId: uuid("source_snapshot_id").references(() => sourceSnapshots.id, {
    onDelete: "set null"
  }),
  modelKey: text("model_key").notNull().default("14a-model-3"),
  validFrom: date("valid_from").notNull(),
  validUntil: date("valid_until"),
  normalizationStatus: text("normalization_status").notNull().default("pending"),
  rawLabel: text("raw_label"),
  rawValue: text("raw_value"),
  sourcePageUrl: text("source_page_url"),
  sourceQuote: text("source_quote"),
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }),
  humanReviewStatus: text("human_review_status").notNull().default("pending"),
  humanReviewNotes: text("human_review_notes"),
  humanReviewedAt: timestamp("human_reviewed_at", { withTimezone: true }),
  valueCtPerKwh: numeric("value_ct_per_kwh", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull().default("ct/kWh"),
  currency: text("currency").notNull().default("EUR"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
