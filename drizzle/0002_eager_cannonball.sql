CREATE TABLE `monthly_selections` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`selectedWeeklyReflectionId` text NOT NULL,
	`reflectionId` text,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reflection_triggers` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`type` text NOT NULL,
	`triggerDate` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`weekNumber` integer,
	`month` integer,
	`year` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reflections` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`type` text NOT NULL,
	`selectedMemoryId` text NOT NULL,
	`aiStory` text NOT NULL,
	`storyType` text NOT NULL,
	`createdAt` text NOT NULL,
	`weekNumber` integer,
	`month` integer,
	`year` integer NOT NULL,
	`promptUsed` text
);
--> statement-breakpoint
CREATE TABLE `weekly_selections` (
	`id` text PRIMARY KEY NOT NULL,
	`userID` text NOT NULL,
	`weekNumber` integer NOT NULL,
	`year` integer NOT NULL,
	`selectedMemoryId` text NOT NULL,
	`reflectionId` text,
	`createdAt` text NOT NULL
);
