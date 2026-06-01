import { config } from "@/config";
import { createHttpClient } from "../http/axios";
import {
  GetPipelineResponse,
  GetStepLogResponse,
  ListPipelinesResponse,
  ListStepsResponse,
} from "./types";
import { UUID } from "crypto";

const client = createHttpClient({
  name: "bitbucket",
  baseURL: "https://api.bitbucket.org/2.0",
  headers: {
    Authorization: `Bearer ${config.BB_API_TOKEN}`,
    Accept: "application/json",
  },
});

export const getPipelinesList = async () => {
  const response = await client.get<ListPipelinesResponse>(
    `repositories/${config.BB_WORKSPACE}/${config.BB_REPO}/pipelines/?sort=-created_on&pagelen=20`,
  );

  return response.data;
};

export const getPipelineDetail = async (id: string) => {
  const response = await client.get<GetPipelineResponse>(
    `repositories/${config.BB_WORKSPACE}/${config.BB_REPO}/pipelines/${encodeURIComponent(id)}`,
  );

  return response.data;
};

export const getPipelineSteps = async (pipelineId: string) => {
  const response = await client.get<ListStepsResponse>(
    `repositories/${config.BB_WORKSPACE}/${config.BB_REPO}/pipelines/${encodeURIComponent(pipelineId)}/steps/`,
  );

  return response.data;
};

export const getPipelineStepLog = async (
  pipelineId: string,
  stepId: string,
) => {
  // The log endpoint serves text/plain, so override the client's default
  // `Accept: application/json` (which triggers a 406) and skip JSON parsing.
  const response = await client.get<GetStepLogResponse>(
    `repositories/${config.BB_WORKSPACE}/${config.BB_REPO}/pipelines/${encodeURIComponent(pipelineId)}/steps/${encodeURIComponent(stepId)}/log`,
    { responseType: "text", headers: { Accept: "text/plain, */*" } },
  );

  return response.data;
};
