import { eq } from "drizzle-orm";
import { db } from "@/core/db";
import { Subscriber } from "@/core/db/schemas/user";

export type SubscriberRow = typeof Subscriber.$inferSelect;
export type NewSubscriber = typeof Subscriber.$inferInsert;

/**
 * Add a subscriber. Idempotent on chatId: if the chat is already
 * subscribed the existing row is kept and returned untouched.
 */
export const addSubscriber = async (
  data: NewSubscriber,
): Promise<SubscriberRow> => {
  const [row] = await db
    .insert(Subscriber)
    .values(data)
    .onConflictDoNothing({ target: Subscriber.chatId })
    .returning();

  if (row) return row;

  const existing = await getSubscriber(data.chatId!);
  return existing!;
};

export const getSubscriber = async (
  chatId: number,
): Promise<SubscriberRow | undefined> => {
  const [row] = await db
    .select()
    .from(Subscriber)
    .where(eq(Subscriber.chatId, chatId))
    .limit(1);

  return row;
};

export const listSubscribers = async (): Promise<SubscriberRow[]> => {
  return db.select().from(Subscriber);
};

/**
 * Delete a subscriber by chatId. Returns the deleted row, or undefined
 * if no subscriber existed for the given chatId.
 */
export const deleteSubscriber = async (
  chatId: number,
): Promise<SubscriberRow | undefined> => {
  const [row] = await db
    .delete(Subscriber)
    .where(eq(Subscriber.chatId, chatId))
    .returning();

  return row;
};
