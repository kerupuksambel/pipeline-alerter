import { addSubscriber, deleteSubscriber } from "@/core/db/repositories/user";
import TelegramBot from "node-telegram-bot-api";
import { Log } from "@/utils/log";

export function registerHandlers(bot: TelegramBot): void {
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    try {
      await addSubscriber({
        chatId,
        userId: userId !== undefined ? String(userId) : null,
      });
      Log.info(`[TELEBOT] Subscribed chat ${chatId} (user ${userId})`);
    } catch (err) {
      Log.error(`[TELEBOT] Failed to subscribe chat ${chatId}. Error: ${err}`);
    }
  });

  bot.onText(/\/stop/, async (msg) => {
    const chatId = msg.chat.id;

    try {
      const removed = await deleteSubscriber(chatId);
      if (removed) {
        Log.info(`[TELEBOT] Unsubscribed chat ${chatId}`);
      } else {
        Log.info(`[TELEBOT] No subscription found for chat ${chatId}`);
      }
    } catch (err) {
      Log.error(
        `[TELEBOT] Failed to unsubscribe chat ${chatId}. Error: ${err}`,
      );
    }
  });

  bot.on("polling_error", (err) => {
    Log.error(`[TELEBOT] Polling error: ${err.message}`);
  });
}
