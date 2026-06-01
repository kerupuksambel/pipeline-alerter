import { config } from "@/config";
import { createHttpClient } from "../http/axios";
import { GetPipelineResponse, ListPipelinesResponse } from "./types";
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
    `repositories/${config.BB_WORKSPACE}/${config.BB_REPO}/pipelines/`,
  );

  return response.data;
};

export const getPipelineDetail = async (id: string) => {
  const response = await client.get<GetPipelineResponse>(
    `repositories/${config.BB_WORKSPACE}/${config.BB_REPO}/pipelines/${encodeURIComponent(id)}`,
  );

  return response.data;
};
