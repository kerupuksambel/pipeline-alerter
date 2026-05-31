import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const Subscriber = sqliteTable("subscribers", {
  chatId: integer("chat_id").primaryKey(), // Telegram chat IDs are unique
  userId: text("user_id"),
  subscribedAt: integer("subscribed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
