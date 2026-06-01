PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pipelines` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_pipelines`("id", "status", "updated_at") SELECT "id", "status", "updated_at" FROM `pipelines`;--> statement-breakpoint
DROP TABLE `pipelines`;--> statement-breakpoint
ALTER TABLE `__new_pipelines` RENAME TO `pipelines`;--> statement-breakpoint
PRAGMA foreign_keys=ON;