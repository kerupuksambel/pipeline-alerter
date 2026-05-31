import { config } from "@/config";
import TelegramBot from "node-telegram-bot-api";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });
