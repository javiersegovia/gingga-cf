CREATE TABLE IF NOT EXISTS "chats" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text NOT NULL,
	"sender" text NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "complexity_assessment_criteria" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"score" real NOT NULL,
	"justification" text NOT NULL,
	"functionality_time_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connections" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_name" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "function_points" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_functionality_id" uuid NOT NULL,
	"type" text NOT NULL,
	"complexity" text NOT NULL,
	"complexity_metric_score" real NOT NULL,
	"function_points" integer NOT NULL,
	CONSTRAINT "function_points_project_functionality_id_unique" UNIQUE("project_functionality_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "functionality_time" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_functionality_id" uuid NOT NULL,
	"complexity_metric_score" real,
	"complexity_explanation" text,
	"fpa_estimate" integer,
	"final_estimate" integer,
	"estimated_hours" real,
	"actual_hours" real,
	CONSTRAINT "functionality_time_project_functionality_id_unique" UNIQUE("project_functionality_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "general_modules" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"additional_info" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "module_time" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_module_id" uuid NOT NULL,
	"complexity_metric_score" real,
	"complexity_explanation" text,
	"fpa_estimate" integer,
	"final_estimate" integer,
	"estimated_hours" real,
	"actual_hours" real,
	CONSTRAINT "module_time_project_module_id_unique" UNIQUE("project_module_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "passwords" (
	"hash" text NOT NULL,
	"user_id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"access" text NOT NULL,
	"description" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_functionalities" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"acceptance_criteria" text[],
	"project_id" uuid NOT NULL,
	"project_module_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_modules" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"additional_info" text,
	"order" integer DEFAULT 0 NOT NULL,
	"general_module_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_timelines" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"summary" text,
	CONSTRAINT "project_timelines_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deleted_at" timestamp,
	"user_id" uuid,
	"slug" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"main_objective" text NOT NULL,
	"specific_objectives" text[],
	"metadata" jsonb,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_cases" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_functionality_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeline_items" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_timeline_id" uuid NOT NULL,
	"type" text NOT NULL,
	"month_number" integer NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeline_items_to_project_modules" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"timeline_item_id" uuid NOT NULL,
	"project_module_id" uuid NOT NULL,
	CONSTRAINT "timeline_items_to_project_modules_timeline_item_id_project_module_id_pk" PRIMARY KEY("timeline_item_id","project_module_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verifications" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"target" text NOT NULL,
	"secret" text NOT NULL,
	"algorithm" text NOT NULL,
	"digits" integer NOT NULL,
	"period" integer NOT NULL,
	"char_set" text NOT NULL,
	"user_id" uuid,
	"expires_at" timestamp,
	CONSTRAINT "verifications_target_type_unique" UNIQUE("target","type")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complexity_assessment_criteria" ADD CONSTRAINT "complexity_assessment_criteria_functionality_time_id_functionality_time_id_fk" FOREIGN KEY ("functionality_time_id") REFERENCES "public"."functionality_time"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "function_points" ADD CONSTRAINT "function_points_project_functionality_id_project_functionalities_id_fk" FOREIGN KEY ("project_functionality_id") REFERENCES "public"."project_functionalities"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "functionality_time" ADD CONSTRAINT "functionality_time_project_functionality_id_project_functionalities_id_fk" FOREIGN KEY ("project_functionality_id") REFERENCES "public"."project_functionalities"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "module_time" ADD CONSTRAINT "module_time_project_module_id_project_modules_id_fk" FOREIGN KEY ("project_module_id") REFERENCES "public"."project_modules"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "passwords" ADD CONSTRAINT "passwords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_functionalities" ADD CONSTRAINT "project_functionalities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_functionalities" ADD CONSTRAINT "project_functionalities_project_module_id_project_modules_id_fk" FOREIGN KEY ("project_module_id") REFERENCES "public"."project_modules"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_modules" ADD CONSTRAINT "project_modules_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_modules" ADD CONSTRAINT "project_modules_general_module_id_general_modules_id_fk" FOREIGN KEY ("general_module_id") REFERENCES "public"."general_modules"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_timelines" ADD CONSTRAINT "project_timelines_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_project_functionality_id_project_functionalities_id_fk" FOREIGN KEY ("project_functionality_id") REFERENCES "public"."project_functionalities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_project_timeline_id_project_timelines_id_fk" FOREIGN KEY ("project_timeline_id") REFERENCES "public"."project_timelines"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_items_to_project_modules" ADD CONSTRAINT "timeline_items_to_project_modules_timeline_item_id_timeline_items_id_fk" FOREIGN KEY ("timeline_item_id") REFERENCES "public"."timeline_items"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeline_items_to_project_modules" ADD CONSTRAINT "timeline_items_to_project_modules_project_module_id_project_modules_id_fk" FOREIGN KEY ("project_module_id") REFERENCES "public"."project_modules"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "verifications" ADD CONSTRAINT "verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
