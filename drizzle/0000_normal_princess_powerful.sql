CREATE TABLE `event_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`page` text,
	`feature` text NOT NULL,
	`subtype` text,
	`event_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `wiki_site`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `wiki_user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `usage_rollup` (
	`site_id` integer DEFAULT 0 NOT NULL,
	`user_id` integer DEFAULT 0 NOT NULL,
	`feature` text DEFAULT '' NOT NULL,
	`period_kind` text NOT NULL,
	`period_start` integer DEFAULT 0 NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_rollup_key` ON `usage_rollup` (`period_kind`,`period_start`,`site_id`,`user_id`,`feature`);--> statement-breakpoint
CREATE INDEX `ix_rollup_period_bucket` ON `usage_rollup` (`period_kind`,`period_start`);--> statement-breakpoint
CREATE INDEX `ix_rollup_site` ON `usage_rollup` (`site_id`);--> statement-breakpoint
CREATE INDEX `ix_rollup_user` ON `usage_rollup` (`user_id`);--> statement-breakpoint
CREATE INDEX `ix_rollup_feature` ON `usage_rollup` (`feature`);--> statement-breakpoint
CREATE TABLE `wiki_site` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`api_url` text NOT NULL,
	`article_path` text NOT NULL,
	`migrated_to_site_id` integer,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	FOREIGN KEY (`migrated_to_site_id`) REFERENCES `wiki_site`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_site_api_url` ON `wiki_site` (`api_url`);--> statement-breakpoint
CREATE INDEX `ix_site_migrated_to` ON `wiki_site` (`migrated_to_site_id`);--> statement-breakpoint
CREATE TABLE `wiki_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`wiki_user_id` integer NOT NULL,
	`site_id` integer NOT NULL,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `wiki_site`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_site_user` ON `wiki_user` (`site_id`,`wiki_user_id`);