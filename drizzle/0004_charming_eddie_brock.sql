PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`date` text NOT NULL,
	`memory` text NOT NULL,
	`magic` text,
	`mood` text,
	`prompt` text,
	`wordCount` integer,
	`createdAt` text NOT NULL DEFAULT (datetime('now')),
	`updatedAt` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
INSERT INTO `__new_users_table`("id", "userID", "month", "year", "date", "memory", "magic", "mood", "prompt", "wordCount") 
SELECT "id", "userID", "month", "year", "date", "memory", "magic", "mood", "prompt", "wordCount"
FROM `users_table`;
--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `__new_users_table` RENAME TO `users_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;