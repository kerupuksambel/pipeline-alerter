CREATE TABLE `acls` (
	`user_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`reason` text DEFAULT 'No reason given.',
	`updated_at` integer NOT NULL
);
