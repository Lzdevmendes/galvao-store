CREATE TABLE `checkout_idempotency` (
	`key` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`result_json` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
