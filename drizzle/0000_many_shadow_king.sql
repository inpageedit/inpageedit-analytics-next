CREATE TABLE `event_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`page_name` text,
	`feature` text NOT NULL,
	`subtype` text,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `wiki_site`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `wiki_user`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `ix_event_time` ON `event_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `wiki_site` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`api_url` text NOT NULL,
	`article_path` text NOT NULL,
	`migrated_to_id` integer,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	FOREIGN KEY (`migrated_to_id`) REFERENCES `wiki_site`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_site_api_url` ON `wiki_site` (`api_url`);--> statement-breakpoint
CREATE INDEX `ix_site_migrated_to` ON `wiki_site` (`migrated_to_id`);--> statement-breakpoint
CREATE TABLE `wiki_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`mw_user_id` integer NOT NULL,
	`site_id` integer NOT NULL,
	`created_at` integer DEFAULT (STRFTIME('%s', 'now')) NOT NULL,
	FOREIGN KEY (`site_id`) REFERENCES `wiki_site`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ux_site_user` ON `wiki_user` (`site_id`,`mw_user_id`);--> statement-breakpoint
CREATE INDEX `ix_user_site_name` ON `wiki_user` (`site_id`,`name`);