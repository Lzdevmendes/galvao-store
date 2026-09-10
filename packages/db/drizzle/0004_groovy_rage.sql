CREATE TABLE `import_pending_items` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`external_ref` text NOT NULL,
	`raw_name` text NOT NULL,
	`raw_brand` text,
	`cost_in_cents` integer,
	`sizes_json` text DEFAULT '[]' NOT NULL,
	`image_urls_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `import_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_pending_items_source_ref_unq` ON `import_pending_items` (`source_id`,`external_ref`);--> statement-breakpoint
CREATE TABLE `import_price_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`match_type` text NOT NULL,
	`match_value` text NOT NULL,
	`brand_id` text,
	`price_in_cents` integer NOT NULL,
	`price_promo_in_cents` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `import_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`started_at` text DEFAULT (datetime('now')) NOT NULL,
	`finished_at` text,
	`status` text,
	`items_found` integer DEFAULT 0 NOT NULL,
	`items_published` integer DEFAULT 0 NOT NULL,
	`items_updated` integer DEFAULT 0 NOT NULL,
	`items_pending_price` integer DEFAULT 0 NOT NULL,
	`error_message` text,
	FOREIGN KEY (`source_id`) REFERENCES `import_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `import_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`base_url` text NOT NULL,
	`parser_key` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`request_delay_ms` integer DEFAULT 1500 NOT NULL,
	`last_run_at` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `products` ADD `external_source_id` text;--> statement-breakpoint
ALTER TABLE `products` ADD `external_ref` text;--> statement-breakpoint
CREATE UNIQUE INDEX `products_external_source_ref_unq` ON `products` (`external_source_id`,`external_ref`);