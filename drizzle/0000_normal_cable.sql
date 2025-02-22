CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`date` text NOT NULL,
	`memory` text NOT NULL,
	`magic` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_email_unique` ON `users_table` (`email`);