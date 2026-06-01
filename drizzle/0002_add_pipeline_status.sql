PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pipelines` (
	`id` text PRIMARY KEY NOT NULL,
	`pipeline_status` text NOT NULL,
	`result_status` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_pipelines`("id", "pipeline_status", "result_status", "updated_at") SELECT "id", 'COMPLETED', "status", "updated_at" FROM `pipelines`;--> statement-breakpoint
DROP TABLE `pipelines`;--> statement-breakpoint
ALTER TABLE `__new_pipelines` RENAME TO `pipelines`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
