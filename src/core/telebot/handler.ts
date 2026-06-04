import { addSubscriber, deleteSubscriber } from "@/core/db/repositories/user";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { Log } from "@/utils/log";
import { onlyAllowed, onlyOwner } from "./middleware";
import { upsertACL } from "../db/repositories/acl";
import { StatusState } from "../db/schemas/acl";

export function registerHandlers(bot: TelegramBot): void {
  bot.onText(
    /\/start/,
    onlyAllowed(bot, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;

      try {
        await addSubscriber({
          chatId,
          userId: userId !== undefined ? String(userId) : null,
        });
        Log.info(`[TELEBOT] Subscribed chat ${chatId} (user ${userId})`);
      } catch (err) {
        Log.error(
          `[TELEBOT] Failed to subscribe chat ${chatId}. Error: ${err}`,
        );
      }
    }),
  );

  bot.onText(
    /\/stop/,
    onlyAllowed(bot, async (msg) => {
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
    }),
  );

  const setACL = async (
    msg: Message,
    match: RegExpExecArray | null,
    status: StatusState,
  ) => {
    const target = match?.[1];

    if (!target || !target.match(/([0-9]+)/)) {
      bot.sendMessage(
        msg.chat.id,
        "User ID format invalid. Ensure the user ID is all numeric, integer value.",
      );

      return;
    }

    await upsertACL(Number(target), status);

    bot.sendMessage(
      msg.chat.id,
      `User ${target} has been added to ${status === "allow" ? "whitelist" : "blacklist"}.`,
    );
  };

  bot.onText(
    /\/acl allow (.+)/,
    onlyOwner(bot, async (msg, match) => setACL(msg, match, "allow")),
  );

  bot.onText(
    /\/acl deny (.+)/,
    onlyOwner(bot, async (msg, match) => setACL(msg, match, "deny")),
  );

  bot.on("polling_error", (err) => {
    Log.error(`[TELEBOT] Polling error: ${err.message}`);
  });
}
