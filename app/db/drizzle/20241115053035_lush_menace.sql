DROP INDEX IF EXISTS "function_points_project_functionality_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "functionality_time_project_functionality_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "module_time_project_module_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "project_timelines_project_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "projects_slug_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "roles_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "verifications_target_type_unique";--> statement-breakpoint
ALTER TABLE `projects` ALTER COLUMN "specific_objectives" TO "specific_objectives" text;--> statement-breakpoint
CREATE UNIQUE INDEX `function_points_project_functionality_id_unique` ON `function_points` (`project_functionality_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `functionality_time_project_functionality_id_unique` ON `functionality_time` (`project_functionality_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `module_time_project_module_id_unique` ON `module_time` (`project_module_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_timelines_project_id_unique` ON `project_timelines` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `verifications_target_type_unique` ON `verifications` (`target`,`type`);