// ============================================================================
// Bitbucket Cloud Pipelines API — TypeScript schema (slim)
//
// Covered endpoints:
//   GET /2.0/repositories/{workspace}/{repo_slug}/pipelines/         (list)
//   GET /2.0/repositories/{workspace}/{repo_slug}/pipelines/{uuid}   (detail)
//
// Fields kept (everything else dropped):
//   - commit hash
//   - branch
//   - pipeline identifier (uuid + build_number)
//   - status (state)
//   - trigger
// ============================================================================

// ---------- List envelope ---------------------------------------------------

export interface Paginated<T> {
  size?: number;
  page?: number;
  pagelen: number;
  next?: string;
  previous?: string;
  values: T[];
}

// ---------- Target (discriminated on `type`) --------------------------------
// We keep the union because commit + branch live in different sub-fields
// depending on what kind of target this is. Use the helpers below to flatten.

export type PipelineRefType = "branch" | "tag" | "named_branch" | "bookmark";

export interface PipelineRefTarget {
  type: "pipeline_ref_target";
  ref_type: PipelineRefType;
  ref_name: string; // <-- branch / tag name lives here
  commit?: { hash: string }; // <-- commit hash
}

export interface PipelineCommitTarget {
  type: "pipeline_commit_target";
  commit: { hash: string };
  ref_name?: string; // sometimes present
  ref_type?: PipelineRefType;
}

export interface PipelinePullRequestTarget {
  type: "pipeline_pullrequest_target";
  source: string; // <-- PR source branch
  destination: string; // PR target branch
  commit?: { hash: string };
  destination_commit?: { hash: string };
  pull_request_id?: number;
}

export type PipelineTarget =
  | PipelineRefTarget
  | PipelineCommitTarget
  | PipelinePullRequestTarget;

// ---------- Trigger ---------------------------------------------------------

export type PipelineTriggerType =
  | "pipeline_trigger_push"
  | "pipeline_trigger_manual"
  | "pipeline_trigger_schedule"
  | "pipeline_trigger_parent_pipeline";

export interface PipelineTrigger {
  type: PipelineTriggerType | string; // string fallback for forward-compat
  name?: string;
}

// ---------- State (discriminated on `name`) ---------------------------------

export type PipelineResultName =
  | "SUCCESSFUL"
  | "FAILED"
  | "ERROR"
  | "STOPPED"
  | "EXPIRED";

export type PipelineState =
  | { name: "PENDING" }
  | { name: "IN_PROGRESS"; stage?: { name: "RUNNING" | "PAUSED" | "HALTED" } }
  | { name: "COMPLETED"; result: { name: PipelineResultName } };

// ---------- The pipeline object --------------------------------------------

export interface BitbucketPipeline {
  uuid: string; // includes braces: "{uuid}"
  build_number: number; // human-friendly identifier
  target: PipelineTarget;
  trigger: PipelineTrigger;
  state: PipelineState;
}

// ---------- Response types --------------------------------------------------

export type ListPipelinesResponse = Paginated<BitbucketPipeline>;
export type GetPipelineResponse = BitbucketPipeline;
