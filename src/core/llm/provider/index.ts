import { config } from "@/config";
import { PipelineStep, PipelineStepLog } from "@/core/bitbucket/types";
import { Log } from "@/utils/log";
import { sanitizeTelegramHtml } from "@/utils/formatter";
import { generateText, LanguageModel } from "ai";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAI } from "@ai-sdk/openai";

// Pick the LLM client based on config.LLM_PROVIDER. We use dynamic import so the
// unselected provider is never instantiated (e.g. the OpenAI constructor throws
// when OPENAI_API_TOKEN is unset, which it is when running on Bedrock).
// const { client } =
//   config.LLM_PROVIDER === "openai"
//     ? await import("./openai")
//     : await import("./bedrock");

export const startConversation = (prompt: string) => {};

export type LLMClientOptions = {
  temperature: number;
  maxToken: number;
};

export class LLMClient {
  private provider: string;
  private model: LanguageModel;

  constructor() {
    this.provider = config.LLM_PROVIDER;

    if (config.LLM_PROVIDER === "bedrock") {
      this.model = createAmazonBedrock({
        region: config.AWS_REGION,
        apiKey: config.AWS_BEARER_TOKEN_BEDROCK,
      })(config.LLM_DEFAULT_MODEL);
    } else {
      this.model = createOpenAI({
        apiKey: config.OPENAI_API_TOKEN,
        baseURL: config.OPENAI_BASE_URL,
      })(config.LLM_DEFAULT_MODEL);
    }
  }

  async chat(prompt: string, options?: LLMClientOptions): Promise<string> {
    const response = await generateText({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      temperature: options ? options.temperature : 0.3,
      // maxOutputTokens: options ? options.maxToken : 1024,
    });

    return response.text;
  }
}
