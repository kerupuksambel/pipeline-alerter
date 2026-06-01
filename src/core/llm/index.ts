import { config } from "@/config";
import { PipelineStep, PipelineStepLog } from "../bitbucket/types";
import { client } from "./bedrock";
import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

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

  return response.output?.message?.content?.[0]?.text ?? "";
};
