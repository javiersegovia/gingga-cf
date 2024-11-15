// This is intended to be used for AI tools to understand the schema
// Soon to be replaced by a more dynamic approach thanks to Drizzle functions

import {
  complexityAssessmentCriterionType,
  projectFunctionalityType,
} from './schema'

export const SchemaSQLString = `
-- Core Project Tables
CREATE TABLE "projects" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "main_objective" text NOT NULL,
  "specific_objectives" text NOT NULL, -- JSON array
  "user_id" text REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  "slug" text UNIQUE,
  "metadata" text, -- JSON
  "created_at" integer NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" integer,
  "deleted_at" integer
);

-- Project Structure Tables
CREATE TABLE "project_modules" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES projects(id),
  "name" text NOT NULL,
  "description" text NOT NULL,
  "additional_info" text,
  "order" integer NOT NULL DEFAULT 0,
  "general_module_id" text REFERENCES general_modules(id),
  "created_at" integer NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" integer
);

CREATE TABLE "project_functionalities" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "project_module_id" text NOT NULL REFERENCES project_modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "type" text NOT NULL,
  "acceptance_criteria" text NOT NULL, -- JSON array
  "created_at" integer NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" integer
);

-- Time Tracking Tables
CREATE TABLE "functionality_time" (
  "id" text PRIMARY KEY NOT NULL,
  "project_functionality_id" text NOT NULL UNIQUE REFERENCES project_functionalities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "complexity_metric_score" real,
  "complexity_explanation" text,
  "fpa_estimate" integer,
  "final_estimate" integer,
  "estimated_hours" real,
  "actual_hours" real,
  "created_at" integer NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" integer
);

CREATE TABLE "module_time" (
  "id" text PRIMARY KEY NOT NULL,
  "project_module_id" text NOT NULL UNIQUE REFERENCES project_modules(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "complexity_metric_score" real,
  "complexity_explanation" text,
  "fpa_estimate" integer,
  "final_estimate" integer,
  "estimated_hours" real,
  "actual_hours" real,
  "created_at" integer NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" integer
);

-- Timeline Management
CREATE TABLE "project_timelines" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "summary" text,
  "created_at" integer NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" integer
);

CREATE TABLE "timeline_items" (
  "id" text PRIMARY KEY NOT NULL,
  "project_timeline_id" text NOT NULL REFERENCES project_timelines(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "type" text NOT NULL CHECK (type IN ('BASIC', 'PREMIUM')),
  "month_number" integer NOT NULL,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "created_at" integer NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  "updated_at" integer
);

-- Important Notes:
1. All tables include created_at (NOT NULL, defaulting to CURRENT_TIMESTAMP) and updated_at timestamps
2. All primary keys are text (UUID strings) and NOT NULL
3. Foreign keys have appropriate CASCADE rules defined
4. JSON fields (stored as text) are:
   - projects.specific_objectives
   - projects.metadata
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
3. complexity_assessment_criteria.type: ${JSON.stringify(complexityAssessmentCriterionType)}
`
