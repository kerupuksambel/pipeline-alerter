PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_acls` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`reason` text DEFAULT 'No reason given.',
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_acls`("user_id", "status", "reason", "updated_at") SELECT "user_id", "status", "reason", "updated_at" FROM `acls`;--> statement-breakpoint
DROP TABLE `acls`;--> statement-breakpoint
ALTER TABLE `__new_acls` RENAME TO `acls`;--> statement-breakpoint
PRAGMA foreign_keys=ON;