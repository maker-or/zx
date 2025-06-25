PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users_table` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`date` text NOT NULL,
	`memory` text NOT NULL,
	`magic` text
);
--> statement-breakpoint
INSERT INTO `__new_users_table`("id", "userID", "month", "year", "date", "memory", "magic") SELECT "id", "userID", "month", "year", "date", "memory", "magic" FROM `users_table`;--> statement-breakpoint
DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `__new_users_table` RENAME TO `users_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;