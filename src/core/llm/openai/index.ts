import { config } from "@/config"; // if you're using .env
import OpenAI from "openai";

export const client = new OpenAI({
  apiKey: config.OPENAI_API_TOKEN,
  baseURL: config.OPENAI_BASE_URL,
});
