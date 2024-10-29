CREATE TABLE IF NOT EXISTS "complexity_assessment_criteria" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"score" integer NOT NULL,
	"justification" text NOT NULL,
	"complexity_metric_id" uuid NOT NULL,
	CONSTRAINT "complexity_assessment_criteria_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "complexity_metrics" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"complexity_score" integer DEFAULT 0 NOT NULL,
	"project_task_id" uuid NOT NULL
);
--> statement-breakpoint
DROP TABLE "audit_logs";--> statement-breakpoint
DROP TABLE "functionality_tags";--> statement-breakpoint
DROP TABLE "project_details";--> statement-breakpoint
DROP TABLE "project_module_tags";--> statement-breakpoint
DROP TABLE "project_steps";--> statement-breakpoint
DROP TABLE "tags";--> statement-breakpoint
ALTER TABLE "functionality_categories" RENAME TO "general_modules";--> statement-breakpoint
ALTER TABLE "project_modules" DROP CONSTRAINT "project_modules_functionality_id_functionalities_id_fk";
--> statement-breakpoint
ALTER TABLE "acceptance_criteria" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "connections" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "functionalities" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "general_modules" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_metadata" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_modules" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_tasks" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "test_cases" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_modules" ADD COLUMN "general_module_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complexity_assessment_criteria" ADD CONSTRAINT "complexity_assessment_criteria_complexity_metric_id_complexity_metrics_id_fk" FOREIGN KEY ("complexity_metric_id") REFERENCES "public"."complexity_metrics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "complexity_metrics" ADD CONSTRAINT "complexity_metrics_project_task_id_project_tasks_id_fk" FOREIGN KEY ("project_task_id") REFERENCES "public"."project_tasks"("id") ON DELETE no action ON UPDATE no action;
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
ALTER TABLE "functionalities" DROP COLUMN IF EXISTS "time_estimation_in_hours";--> statement-breakpoint
ALTER TABLE "project_modules" DROP COLUMN IF EXISTS "functionality_id";--> statement-breakpoint
ALTER TABLE "project_tasks" DROP COLUMN IF EXISTS "priority";--> statement-breakpoint
ALTER TABLE "project_tasks" DROP COLUMN IF EXISTS "complexity";--> statement-breakpoint
ALTER TABLE "project_tasks" DROP COLUMN IF EXISTS "complexity_score";--> statement-breakpoint
ALTER TABLE "project_tasks" DROP COLUMN IF EXISTS "time_estimation_hours";