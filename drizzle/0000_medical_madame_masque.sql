CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`until` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`action` text NOT NULL,
	`detail` text NOT NULL,
	`at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_team_date` ON `audit` (`team`,`at`);--> statement-breakpoint
CREATE TABLE `matches` (
	`team` text NOT NULL,
	`id` text NOT NULL,
	`data` text NOT NULL,
	`override` text,
	`playedAt` text NOT NULL,
	`importedAt` text NOT NULL,
	PRIMARY KEY(`team`, `id`)
);
--> statement-breakpoint
CREATE INDEX `idx_matches_team_date` ON `matches` (`team`,`playedAt`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text NOT NULL,
	`team` text NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`createdAt` text NOT NULL,
	PRIMARY KEY(`team`, `id`)
);
--> statement-breakpoint
CREATE INDEX `idx_records_team_kind` ON `records` (`team`,`kind`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`role` text NOT NULL,
	`version` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_team` ON `sessions` (`team`,`expires`);--> statement-breakpoint
CREATE TABLE `settings` (
	`team` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`team` text NOT NULL,
	`source` text NOT NULL,
	`data` text NOT NULL,
	`at` text NOT NULL,
	PRIMARY KEY(`team`, `source`)
);
--> statement-breakpoint
CREATE TABLE `sync_locks` (
	`team` text PRIMARY KEY NOT NULL,
	`until` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`at` text NOT NULL,
	`status` text NOT NULL,
	`detail` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sync_team_date` ON `sync_runs` (`team`,`at`);--> statement-breakpoint
CREATE TABLE `votes` (
	`team` text NOT NULL,
	`pollId` text NOT NULL,
	`voter` text NOT NULL,
	`choice` text NOT NULL,
	PRIMARY KEY(`team`, `pollId`, `voter`)
);
