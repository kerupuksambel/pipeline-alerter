import { config } from "@/config";
import {
  addSubscriber,
  deleteSubscriber,
  listSubscribers,
} from "@/core/db/repositories/user";
import { Log } from "@/utils/log";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { registerHandlers } from "./handler";

/**
 * Thin wrapper around node-telegram-bot-api that owns the polling lifecycle.
 *
 * Polling is started explicitly via `start()` (not in the constructor) and
 * must be torn down via `stop()` on shutdown — otherwise Telegram keeps the
 * previous long-poll `getUpdates` slot open and a freshly (re)started process
 * collides with it, yielding `409 Conflict: terminated by other getUpdates`.
 */
export class TeleBot {
  private readonly bot: TelegramBot;
  private started = false;

  constructor(token: string) {
    // polling is started lazily in start(), not here.
    this.bot = new TelegramBot(token, { polling: false });
    registerHandlers(this.bot);
  }

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;
    await this.bot.startPolling();
    Log.info("[TELEBOT] Telegram bot is polling.");
  }

  /** Stop polling so Telegram releases the getUpdates slot for the next run. */
  async stop(): Promise<void> {
    if (!this.started) return;
    this.started = false;
    try {
      await this.bot.stopPolling({ cancel: true });
      Log.info("[TELEBOT] Polling stopped.");
    } catch (err) {
      Log.error(`[TELEBOT] Failed to stop polling. Error: ${err}`);
    }
  }

  async sendMessage(chatID: number, message: string): Promise<Message> {
    return this.bot.sendMessage(chatID, message, { parse_mode: "HTML" });
  }

  async broadcastMessages(message: string): Promise<Message[]> {
    const subscribers = await listSubscribers();

    return Promise.all(
      subscribers.map(async (sub) => {
        Log.info(`[Telebot] Sending message to ID ${sub.chatId}`);
        return this.sendMessage(sub.chatId, message);
      }),
    );
  }
}

export const teleBot = new TeleBot(config.TELEGRAM_BOT_TOKEN);
