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
  valueCtPerKwh: numeric("value_ct_per_kwh", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull().default("ct/kWh"),
  currency: text("currency").notNull().default("EUR"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
