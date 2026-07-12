CREATE TABLE `action_priorities` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` int NOT NULL DEFAULT 0,
	`status` varchar(64) NOT NULL DEFAULT 'open',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `action_priorities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`session_id` varchar(21) NOT NULL,
	`role` varchar(32) NOT NULL,
	`content` text NOT NULL,
	`context` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT 'Ny konversation',
	`message_count` int NOT NULL DEFAULT 0,
	`last_message_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `chat_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `day_plans` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`plan_date` timestamp NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `day_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`quantity` int NOT NULL DEFAULT 1,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `inventory_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plan_analyses` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`day_plan_id` varchar(21),
	`summary` text NOT NULL,
	`analysis` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `plan_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` varchar(21) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_session_id_chat_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plan_analyses` ADD CONSTRAINT `plan_analyses_day_plan_id_day_plans_id_fk` FOREIGN KEY (`day_plan_id`) REFERENCES `day_plans`(`id`) ON DELETE no action ON UPDATE no action;