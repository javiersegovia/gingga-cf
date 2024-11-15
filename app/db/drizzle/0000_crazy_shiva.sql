CREATE TABLE IF NOT EXISTS `chats` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`sender` text NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `complexity_assessment_criteria` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`score` real NOT NULL,
	`justification` text NOT NULL,
	`functionality_time_id` text NOT NULL,
	FOREIGN KEY (`functionality_time_id`) REFERENCES `functionality_time`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `connections` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`provider_name` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `function_points` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_functionality_id` text NOT NULL,
	`type` text NOT NULL,
	`complexity` text NOT NULL,
	`complexity_metric_score` real NOT NULL,
	`function_points` integer NOT NULL,
	FOREIGN KEY (`project_functionality_id`) REFERENCES `project_functionalities`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `function_points_project_functionality_id_unique` ON `function_points` (`project_functionality_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `functionality_time` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_functionality_id` text NOT NULL,
	`complexity_metric_score` real,
	`complexity_explanation` text,
	`fpa_estimate` integer,
	`final_estimate` integer,
	`estimated_hours` real,
	`actual_hours` real,
	FOREIGN KEY (`project_functionality_id`) REFERENCES `project_functionalities`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `functionality_time_project_functionality_id_unique` ON `functionality_time` (`project_functionality_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `general_modules` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`additional_info` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `module_time` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_module_id` text NOT NULL,
	`complexity_metric_score` real,
	`complexity_explanation` text,
	`fpa_estimate` integer,
	`final_estimate` integer,
	`estimated_hours` real,
	`actual_hours` real,
	FOREIGN KEY (`project_module_id`) REFERENCES `project_modules`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `module_time_project_module_id_unique` ON `module_time` (`project_module_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `passwords` (
	`hash` text NOT NULL,
	`user_id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `permissions` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`access` text NOT NULL,
	`description` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_functionalities` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`acceptance_criteria` text,
	`project_id` text NOT NULL,
	`project_module_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`project_module_id`) REFERENCES `project_modules`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_modules` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`additional_info` text,
	`order` integer DEFAULT 0 NOT NULL,
	`general_module_id` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`general_module_id`) REFERENCES `general_modules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_timelines` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`summary` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `project_timelines_project_id_unique` ON `project_timelines` (`project_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `projects` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`deleted_at` integer,
	`user_id` text,
	`slug` text,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`main_objective` text NOT NULL,
	`specific_objectives` text NOT NULL,
	`metadata` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `roles` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT ''
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`expiration_date` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `test_cases` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_functionality_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`project_functionality_id`) REFERENCES `project_functionalities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `timeline_items` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_timeline_id` text NOT NULL,
	`type` text NOT NULL,
	`month_number` integer NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	FOREIGN KEY (`project_timeline_id`) REFERENCES `project_timelines`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `timeline_items_to_project_modules` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`timeline_item_id` text NOT NULL,
	`project_module_id` text NOT NULL,
	PRIMARY KEY(`timeline_item_id`, `project_module_id`),
	FOREIGN KEY (`timeline_item_id`) REFERENCES `timeline_items`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`project_module_id`) REFERENCES `project_modules`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verifications` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`target` text NOT NULL,
	`secret` text NOT NULL,
	`algorithm` text NOT NULL,
	`digits` integer NOT NULL,
	`period` integer NOT NULL,
	`char_set` text NOT NULL,
	`user_id` text,
	`expires_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `verifications_target_type_unique` ON `verifications` (`target`,`type`);