import { config } from "@/config"; // if you're using .env
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

export const client = new BedrockRuntimeClient({ region: config.AWS_REGION });
