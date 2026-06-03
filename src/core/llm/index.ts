import { Log } from "@/utils/log";
import { PipelineStep, PipelineStepLog } from "../bitbucket/types";
import { sanitizeTelegramHtml } from "@/utils/formatter";
import { LLMClient } from "./provider";

const client = new LLMClient();

export const analyzePipelineLog = async (
  steps: PipelineStep[],
  logs: PipelineStepLog[],
) => {
  const prompt = `
    You're a SRE engineer with deep capability in Bitbucket pipeline mechanism.

    During a pipeline, it failed in these steps
    ${steps
      .map(
        (step, stepIdx) => `
      - **${step.name}** ended in ${step.state}
      Log:
      --- START OF LOG ---
      ${logs[stepIdx]}
      --- END OF LOG ---

      `,
      )
      .join("\n")}

    I want you to analyze the possible cause of the failing steps, and what I should do

    Your analysis must be :
    1. Concise, no fluff, no unnecessary emoji, no unnecessary words. Only your analysis, consisted of what happened, and what's your call to check.
    2. Formatted in HTML, but only including <b>, <i>, <a> if you want to include references, and <code> for the codeblock.
    3. Use newline character if you want to make a new line. Don't use <br/> for linebreak.
    4. Keep it below 2,000 characters (including the HTML tags)
  `;
  const responseText = await client.chat(prompt);

  const sanitized = sanitizeTelegramHtml(responseText);
  return sanitized;
};
