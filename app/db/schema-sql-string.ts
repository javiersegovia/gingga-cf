// This is intended to be used for AI tools to understand the schema

import { projectFunctionalityType } from './schema'

export const SchemaSQLString = `
-- Core Project Tables
CREATE TABLE "projects" (
  "id" uuid PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "main_objective" text NOT NULL,
  "specific_objectives" text[],
  "user_id" uuid REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  "slug" text UNIQUE,
  "metadata" jsonb,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

-- Project Structure Tables
CREATE TABLE "project_modules" (
  "id" uuid PRIMARY KEY NOT NULL,
  "project_id" uuid NOT NULL REFERENCES projects(id),
  "name" text NOT NULL,
  "description" text NOT NULL,
  "additional_info" text,
  "order" integer NOT NULL DEFAULT 0,
  "general_module_id" uuid REFERENCES general_modules(id),
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "project_functionalities" (
  "id" uuid PRIMARY KEY NOT NULL,
  "project_id" uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "project_module_id" uuid NOT NULL REFERENCES project_modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "type" text NOT NULL,
  "acceptance_criteria" text[],
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp
);

-- Time Tracking Tables
CREATE TABLE "functionality_time" (
  "id" uuid PRIMARY KEY NOT NULL,
  "project_functionality_id" uuid NOT NULL UNIQUE REFERENCES project_functionalities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "complexity_metric_score" real,
  "complexity_explanation" text,
  "fpa_estimate" integer,
  "final_estimate" integer,
  "estimated_hours" real,
  "actual_hours" real,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "module_time" (
  "id" uuid PRIMARY KEY NOT NULL,
  "project_module_id" uuid NOT NULL UNIQUE REFERENCES project_modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "complexity_metric_score" real,
  "complexity_explanation" text,
  "fpa_estimate" integer,
  "final_estimate" integer,
  "estimated_hours" real,
  "actual_hours" real,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp
);

-- Timeline Management
CREATE TABLE "project_timelines" (
  "id" uuid PRIMARY KEY NOT NULL,
  "project_id" uuid NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "summary" text,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp
);

CREATE TABLE "timeline_items" (
  "id" uuid PRIMARY KEY NOT NULL,
  "project_timeline_id" uuid NOT NULL REFERENCES project_timelines(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "type" text NOT NULL,
  "month_number" integer NOT NULL,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp
);

-- Important Notes:
1. All tables include created_at (NOT NULL, defaulting to NOW()) and updated_at timestamps
2. All primary keys are UUIDs and NOT NULL
3. Foreign keys have appropriate CASCADE rules defined
4. Array fields (text[]) are:
   - projects.specific_objectives
   - project_functionalities.acceptance_criteria
5. Unique constraints are on:
   - projects.slug
   - functionality_time.project_functionality_id
   - module_time.project_module_id
   - project_timelines.project_id

-- Common Relationships:
1. projects -> project_modules (one-to-many)
2. projects -> project_functionalities (one-to-many)
3. project_modules -> project_functionalities (one-to-many)
4. project_functionalities -> functionality_time (one-to-one)
5. project_modules -> module_time (one-to-one)
6. projects -> project_timelines (one-to-one)
7. project_timelines -> timeline_items (one-to-many)

-- Enum Types Used:
1. project_functionalities.type: ${JSON.stringify(projectFunctionalityType)}
2. timeline_items.type: ['BASIC', 'PREMIUM']
`
