CREATE TABLE `analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`date` text NOT NULL,
	`memoryCount` integer DEFAULT 0 NOT NULL,
	`totalWordCount` integer DEFAULT 0 NOT NULL,
	`averageMood` text,
	`reflectionCount` integer DEFAULT 0 NOT NULL,
	`streakDays` integer DEFAULT 0 NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `memory_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`memoryId` text NOT NULL,
	`tagId` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users_table` ADD `mood` text;--> statement-breakpoint
ALTER TABLE `users_table` ADD `prompt` text;--> statement-breakpoint
ALTER TABLE `users_table` ADD `wordCount` integer;--> statement-breakpoint
ALTER TABLE `users_table` ADD `createdAt` text;--> statement-breakpoint
ALTER TABLE `users_table` ADD `updatedAt` text;