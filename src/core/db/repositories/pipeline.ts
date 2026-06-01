import { eq, inArray } from "drizzle-orm";
import { db } from "@/core/db";
import { Pipeline } from "@/core/db/schemas/pipeline";
import type {
  PipelineResultName,
  PipelineState,
} from "@/core/bitbucket/types";

type PipelineStateName = PipelineState["name"];

export type PipelineRow = typeof Pipeline.$inferSelect;
export type NewPipeline = typeof Pipeline.$inferInsert;

/** Insert a new pipeline. Throws if a pipeline with this id already exists. */
export const addPipeline = async (data: NewPipeline): Promise<PipelineRow> => {
  const [row] = await db.insert(Pipeline).values(data).returning();
  return row!;
};

/**
 * Change the state of an existing pipeline. This is the only way state
 * transitions are recorded — the pipeline must already exist (added via
 * {@link addPipeline}). Returns the updated row, or undefined if no
 * pipeline with this id exists.
 */
export const updatePipelineState = async (
  id: string,
  pipelineStatus: PipelineStateName,
  resultStatus: PipelineResultName | null = null,
  updatedAt: Date = new Date(),
): Promise<PipelineRow | undefined> => {
  const [row] = await db
    .update(Pipeline)
    .set({ pipelineStatus, resultStatus, updatedAt })
    .where(eq(Pipeline.id, id))
    .returning();

  return row;
};

export const getPipeline = async (
  id: string,
): Promise<PipelineRow | undefined> => {
  const [row] = await db
    .select()
    .from(Pipeline)
    .where(eq(Pipeline.id, id))
    .limit(1);

  return row;
};

export const getPipelinesByIds = async (
  ids: string[],
): Promise<PipelineRow[]> => {
  if (ids.length === 0) return [];
  return db.select().from(Pipeline).where(inArray(Pipeline.id, ids));
};

export const listPipelines = async (): Promise<PipelineRow[]> => {
  return db.select().from(Pipeline);
};
