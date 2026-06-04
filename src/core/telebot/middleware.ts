import { config } from "@/config";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { TeleBot } from ".";
import { Log } from "@/utils/log";

type Handler = (
  msg: Message,
  match: RegExpExecArray | null,
) => Promise<void> | void;

export const onlyOwner = (bot: TelegramBot, handler: Handler): Handler => {
  return async (msg, match) => {
    Log.info(`ID: ${msg.from?.id}, username: ${msg.from?.username}`);

    if (
      msg.from?.id.toString() !== config.TELEGRAM_BOT_OWNER &&
      `@${msg.from?.username}` !== config.TELEGRAM_BOT_OWNER
    ) {
      console.log(`@${msg.from?.username}` === config.TELEGRAM_BOT_OWNER);
      await bot.sendMessage(
        msg.chat.id,
        "⛔ Sorry, you are not authorized to do this action.",
        { parse_mode: "HTML" },
      );

      return;
    }

    try {
      await handler(msg, match);
    } catch (err) {
      Log.error(`Handler error: ${err}`);
      await bot.sendMessage(msg.chat.id, "⚠️ Something went wrong");
    }
  };
};
