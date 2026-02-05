DROP INDEX `ix_event_time`;--> statement-breakpoint
CREATE INDEX `ix_event_time_site_user` ON `event_log` (`created_at`,`site_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `ix_event_site_time` ON `event_log` (`site_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `ix_event_user_time` ON `event_log` (`user_id`,`created_at`);