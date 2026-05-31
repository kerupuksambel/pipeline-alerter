CREATE TABLE `pipelines` (
	`id` text NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`id`, `status`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`chat_id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`subscribed_at` integer NOT NULL
);
