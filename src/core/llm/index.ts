import { config } from "@/config";
import { PipelineStep, PipelineStepLog } from "../bitbucket/types";
import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { Log } from "@/utils/log";
import { sanitizeTelegramHtml } from "@/utils/formatter";

// Pick the LLM client based on config.LLM_PROVIDER. We use dynamic import so the
// unselected provider is never instantiated (e.g. the OpenAI constructor throws
// when OPENAI_API_TOKEN is unset, which it is when running on Bedrock).
const { client } =
  config.LLM_PROVIDER === "openai"
    ? await import("./openai")
    : await import("./bedrock");

export const analyzePipelineLog = async (
  steps: PipelineStep[],
  logs: PipelineStepLog[],
) => {
  const prompt = `
    You're a SRE engineer with deep capability in Bitbucket pipeline mechanism.

    During a pipeline, it failed in these steps
    ${steps.map(
      (step, stepIdx) => `
      - **${step.name}** ended in ${step.state}
      Log:
      --- START OF LOG ---
      ${logs[stepIdx]}
      --- END OF LOG ---

      `,
    )}

    I want you to analyze the possible cause of the failing steps, and what I should do

    Your analysis must be :
    1. Concise, no fluff, no unnecessary words. Only your analysis, consisted of what happened, and what's your call to check.
    2. Formatted in HTML, but only including <b>, <i>, <a> if you want to include references, and <code> for the codeblock.
    3. Use \n if you want to make a new line
    3. Keep it below 2,000 characters (including the HTML tags)
  `;

  let responseText = "";

  if ("chat" in client) {
    const response = await client.chat.completions.create({
      model: config.LLM_DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.15,
    });

    responseText = response.choices[0]?.message?.content ?? "";
  } else {
    const response = await client.send(
      new ConverseCommand({
        modelId: config.LLM_DEFAULT_MODEL,
        messages: [
          {
            role: "user",
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 1024,
          temperature: 0.15,
        },
      }),
    );

    responseText = response.output?.message?.content?.[0]?.text ?? "";
  }

  const sanitized = sanitizeTelegramHtml(responseText);
  Log.debug(sanitized);
  return sanitized;
};
