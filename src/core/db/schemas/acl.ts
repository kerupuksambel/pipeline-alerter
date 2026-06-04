import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type StatusState = "allow" | "deny";

export const ACL = sqliteTable("acls", {
  userId: integer("user_id").primaryKey(),
  status: text("status").$type<StatusState>().notNull(),
  reason: text("reason").default("No reason given."),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
