import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const Pipeline = sqliteTable(
  "pipelines",
  {
    id: text("id").notNull(),
    status: text("status").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.id, t.status] })],
);
