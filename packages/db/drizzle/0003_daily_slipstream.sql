CREATE TABLE `user_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`anon_id` text,
	`type` text NOT NULL,
	`granted` integer NOT NULL,
	`source` text NOT NULL,
	`ip` text,
	`user_agent` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `newsletter_subscriptions` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `newsletter_subscriptions` ADD `confirm_token` text;--> statement-breakpoint
ALTER TABLE `newsletter_subscriptions` ADD `unsubscribe_token` text;--> statement-breakpoint
ALTER TABLE `newsletter_subscriptions` ADD `confirmed_at` text;