import { customType, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { operators } from "./operators";

const geometry = customType<{ data: string }>({
  dataType() {
    return "geometry(MultiPolygon, 4326)";
  }
});

export const operatorGeometries = pgTable("operator_geometries", {
  id: uuid("id").defaultRandom().primaryKey(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id, { onDelete: "cascade" }),
  sourceLabel: text("source_label").notNull(),
  precision: text("precision").notNull(),
  geometry: geometry("geometry").notNull(),
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow()
});
