import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type {
  PipelineResultName,
  PipelineState,
} from "@/core/bitbucket/types";

/** Lifecycle state name: "PENDING" | "IN_PROGRESS" | "COMPLETED". */
type PipelineStateName = PipelineState["name"];

export const Pipeline = sqliteTable("pipelines", {
  id: text("id").primaryKey(),
  pipelineStatus: text("pipeline_status")
    .$type<PipelineStateName>()
    .notNull(),
  // Only meaningful once pipelineStatus is "COMPLETED"; null otherwise.
  resultStatus: text("result_status").$type<PipelineResultName>(),
  executedAt: integer("executed_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
