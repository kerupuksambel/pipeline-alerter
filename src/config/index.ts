import { Log } from "@/utils/log.js";
import "dotenv/config";
import { z } from "zod";

const schema = z
  .object({
    // Bitbucket
    BB_API_TOKEN: z.string().min(1, "BB_API_TOKEN is required"),
    BB_BOT_EMAIL: z.email("BB_BOT_EMAIL must be a valid email"),
    BB_WORKSPACE: z.string().min(1, "BB_WORKSPACE is required"),
    BB_REPO: z.string().min(1, "BB_REPO is required"),

    // Telegram
    TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),

    // LLM
    LLM_PROVIDER: z.enum(["bedrock", "openai"]).default("bedrock"),
    LLM_DEFAULT_MODEL: z.string().min(1, "LLM_DEFAULT_MODEL is required"),

    // OpenAI
    OPENAI_API_TOKEN: z.string().optional(),
    OPENAI_BASE_URL: z.string().default("https://api.openai.com/v1"),

    // Bedrock
    AWS_BEARER_TOKEN_BEDROCK: z.string().optional(),
    AWS_REGION: z.string().optional(),

    // DB
    DB_FILENAME: z.string().default("database.db"),
  })
  .superRefine((env, ctx) => {
    if (env.LLM_PROVIDER === "openai" && !env.OPENAI_API_TOKEN) {
      ctx.addIssue({
        code: "custom",
        path: ["OPENAI_API_TOKEN"],
        message: "OPENAI_API_TOKEN is required when LLM_PROVIDER is 'openai'",
      });
    }

    if (env.LLM_PROVIDER === "bedrock") {
      if (!env.AWS_BEARER_TOKEN_BEDROCK) {
        ctx.addIssue({
          code: "custom",
          path: ["AWS_BEARER_TOKEN_BEDROCK"],
          message:
            "AWS_BEARER_TOKEN_BEDROCK is required when LLM_PROVIDER is 'bedrock'",
        });
      }
      if (!env.AWS_REGION) {
        ctx.addIssue({
          code: "custom",
          path: ["AWS_REGION"],
          message: "AWS_REGION is required when LLM_PROVIDER is 'bedrock'",
        });
      }
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  Log.error(
    `[CONFIG] Error on environment parsing. Error: ${JSON.stringify(z.treeifyError(parsed.error))}`,
  );
  process.exit(1);
}

export const config = Object.freeze(parsed.data);
