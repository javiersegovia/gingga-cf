CREATE TABLE `chats` (
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
CREATE TABLE `complexity_assessment_criteria` (
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
CREATE TABLE `connections` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`provider_name` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `function_points` (
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
CREATE UNIQUE INDEX `function_points_project_functionality_id_unique` ON `function_points` (`project_functionality_id`);--> statement-breakpoint
CREATE TABLE `functionality_time` (
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
CREATE UNIQUE INDEX `functionality_time_project_functionality_id_unique` ON `functionality_time` (`project_functionality_id`);--> statement-breakpoint
CREATE TABLE `general_modules` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`additional_info` text
);
--> statement-breakpoint
CREATE TABLE `module_time` (
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
CREATE UNIQUE INDEX `module_time_project_module_id_unique` ON `module_time` (`project_module_id`);--> statement-breakpoint
CREATE TABLE `passwords` (
	`hash` text NOT NULL,
	`user_id` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`access` text NOT NULL,
	`description` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `project_functionalities` (
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
CREATE TABLE `project_modules` (
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
CREATE TABLE `project_timelines` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`summary` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_timelines_project_id_unique` ON `project_timelines` (`project_id`);--> statement-breakpoint
CREATE TABLE `projects` (
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
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT ''
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`expiration_date` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `test_cases` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`project_functionality_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`project_functionality_id`) REFERENCES `project_functionalities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `timeline_items` (
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
CREATE TABLE `timeline_items_to_project_modules` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`timeline_item_id` text NOT NULL,
	`project_module_id` text NOT NULL,
	PRIMARY KEY(`timeline_item_id`, `project_module_id`),
	FOREIGN KEY (`timeline_item_id`) REFERENCES `timeline_items`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`project_module_id`) REFERENCES `project_modules`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
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
CREATE UNIQUE INDEX `verifications_target_type_unique` ON `verifications` (`target`,`type`);