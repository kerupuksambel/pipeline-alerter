import {
  BitbucketPipeline,
  PipelineState,
  PipelineStep,
  PipelineTarget,
} from "./types";

/** Normalize "what branch is this pipeline running on" across target types. */
export function getBranchName(target: PipelineTarget): string | undefined {
  switch (target.type) {
    case "pipeline_ref_target":
      return target.ref_name;
    case "pipeline_pullrequest_target":
      return target.source;
    case "pipeline_commit_target":
      return target.ref_name;
  }
}

/** Normalize commit hash across target types. */
export function getCommitHash(target: PipelineTarget): string | undefined {
  return target.commit?.hash;
}

export const isCompleted = (
  s: PipelineState,
): s is Extract<PipelineState, { name: "COMPLETED" }> => s.name === "COMPLETED";

export const isFailed = (p: BitbucketPipeline): boolean =>
  isCompleted(p.state) &&
  (p.state.result.name === "FAILED" || p.state.result.name === "ERROR");

/** A step in a terminal failure state (FAILED or ERROR). */
export const isStepFailed = (step: PipelineStep): boolean =>
  isCompleted(step.state) &&
  (step.state.result.name === "FAILED" || step.state.result.name === "ERROR");

/** All steps of a pipeline that ended in failure (FAILED or ERROR). */
export const getFailedSteps = (steps: PipelineStep[]): PipelineStep[] =>
  steps.filter(isStepFailed);
