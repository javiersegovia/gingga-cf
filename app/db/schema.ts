import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  primaryKey,
  unique,
  jsonb,
  real,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
}

// ________________________________________________________________________________________________
// ENUMS
// ________________________________________________________________________________________________
export const complexity = ['LOW', 'MODERATE', 'HIGH'] as const
export type Complexity = (typeof complexity)[number]

export const functionPointType = ['EI', 'EO', 'EQ', 'ILF', 'EIF'] as const
export type FunctionPointType = (typeof functionPointType)[number]

export const priority = ['LOW', 'MEDIUM', 'HIGH'] as const
export type Priority = (typeof priority)[number]

export const projectFunctionalityType = [
  'AI',
  'SECURITY',
  'FUNCTIONALITY',
  'USABILITY',
  'STYLE',
  'RELIABILITY',
  'PERFORMANCE',
  'SUPPORT',
  'SEO',
  'ACCESSIBILITY',
  'OTHER',
] as const
export type ProjectFunctionalityType = (typeof projectFunctionalityType)[number]

export const projectDetailType = [
  'SECURITY',
  'LEGAL',
  'PRIVACY',
  'COMPLIANCE',
  'ACCESSIBILITY',
  'INTEGRATION',
  'INFRASTRUCTURE',
  'PERFORMANCE',
  'RISK',
  'DEPLOYMENT',
  'LOCALIZATION',
  'OTHER',
] as const
export type ProjectDetailType = (typeof projectDetailType)[number]

export const sender = ['USER', 'AI'] as const
export type Sender = (typeof sender)[number]

export const projectStepName = [
  'DESCRIPTION',
  'OBJECTIVES',
  'MODULES',
  'ROADMAP',
] as const
export type ProjectStepName = (typeof projectStepName)[number]

export const complexityAssessmentCriterionType = [
  'ALGORITHMIC_COMPLEXITY',
  'INTEGRATION_REQUIREMENTS',
  'DEPENDENCIES',
  'PERFORMANCE_REQUIREMENTS',
  'SECURITY_CONCERNS',
] as const
export type ComplexityAssessmentCriterionType =
  (typeof complexityAssessmentCriterionType)[number]

// ________________________________________________________________________________________________
// TABLES
// ________________________________________________________________________________________________
export const Users = pgTable('users', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
})

export const Passwords = pgTable('passwords', {
  hash: text('hash').notNull(),
  userId: uuid('user_id')
    .primaryKey()
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const Sessions = pgTable('sessions', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  expirationDate: timestamp('expiration_date').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const Permissions = pgTable('permissions', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  access: text('access').notNull(),
  description: text('description').default(''),
})

export const Roles = pgTable('roles', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description').default(''),
})

export const UserRoles = pgTable('user_roles', {
  userId: uuid('user_id')
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  roleId: uuid('role_id')
    .notNull()
    .references(() => Roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const RolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => Roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => Permissions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  }),
)

export const Verifications = pgTable(
  'verifications',
  {
    ...timestamps,
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    type: text('type').notNull(),
    target: text('target').notNull(),
    secret: text('secret').notNull(),
    algorithm: text('algorithm').notNull(),
    digits: integer('digits').notNull(),
    period: integer('period').notNull(),
    charSet: text('char_set').notNull(),
    userId: uuid('user_id').references(() => Users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    expiresAt: timestamp('expires_at'),
  },
  (table) => ({
    targetTypeUnique: unique().on(table.target, table.type),
  }),
)

export const Connections = pgTable('connections', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  providerName: text('provider_name').notNull(),
  providerId: text('provider_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const Projects = pgTable('projects', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  deletedAt: timestamp('deleted_at'),
  userId: uuid('user_id').references(() => Users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  slug: text('slug').unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  mainObjective: text('main_objective').notNull(),
  specificObjectives: text('specific_objectives').array(),
  metadata: jsonb('metadata'),
})

export const ProjectModules = pgTable('project_modules', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => Projects.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  additionalInfo: text('additional_info'),
  order: integer('order').notNull().default(0),
  generalModuleId: uuid('general_module_id').references(
    () => GeneralModules.id,
  ),
})

export const ProjectFunctionalities = pgTable('project_functionalities', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: projectFunctionalityType }).notNull(),
  acceptanceCriteria: text('acceptance_criteria').array(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => Projects.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  projectModuleId: uuid('project_module_id')
    .references(() => ProjectModules.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
})

export const TestCases = pgTable('test_cases', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  projectFunctionalityId: uuid('project_functionality_id')
    .notNull()
    .references(() => ProjectFunctionalities.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
})

export const GeneralModules = pgTable('general_modules', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  additionalInfo: text('additional_info'),
})

export const Chats = pgTable('chats', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  message: text('message').notNull(),
  sender: text('sender', { enum: sender }).notNull(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => Projects.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => Users.id),
})

export const FunctionPoints = pgTable('function_points', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  projectFunctionalityId: uuid('project_functionality_id')
    .notNull()
    .references(() => ProjectFunctionalities.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .unique(),

  type: text('type', { enum: functionPointType }).notNull(),
  complexity: text('complexity', { enum: complexity }).notNull(),
  complexityMetricScore: real('complexity_metric_score').notNull(),
  functionPoints: integer('function_points').notNull(),
})

export const ModuleTime = pgTable('module_time', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  projectModuleId: uuid('project_module_id')
    .notNull()
    .references(() => ProjectModules.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .unique(),

  complexityMetricScore: real('complexity_metric_score'),
  complexityExplanation: text('complexity_explanation'),

  fpaEstimate: integer('fpa_estimate'),
  finalEstimate: integer('final_estimate'),

  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
})

export const FunctionalityTime = pgTable('functionality_time', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  projectFunctionalityId: uuid('project_functionality_id')
    .notNull()
    .references(() => ProjectFunctionalities.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .unique(),

  complexityMetricScore: real('complexity_metric_score'),
  complexityExplanation: text('complexity_explanation'),

  fpaEstimate: integer('fpa_estimate'),
  finalEstimate: integer('final_estimate'),

  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
})

export const ComplexityAssessmentCriteria = pgTable(
  'complexity_assessment_criteria',
  {
    ...timestamps,
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    type: text('type', { enum: complexityAssessmentCriterionType }).notNull(),
    score: real('score').notNull(),
    justification: text('justification').notNull(),

    functionalityTimeId: uuid('functionality_time_id')
      .notNull()
      .references(() => FunctionalityTime.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
)

export const ProjectTimelines = pgTable('project_timelines', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => Projects.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .unique(),
  summary: text('summary'),
})

export const TimelineItems = pgTable('timeline_items', {
  ...timestamps,
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  projectTimelineId: uuid('project_timeline_id')
    .notNull()
    .references(() => ProjectTimelines.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),

  type: text('type', { enum: ['BASIC', 'PREMIUM'] }).notNull(),
  monthNumber: integer('month_number').notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
})

export const TimelineItemsToProjectModules = pgTable(
  'timeline_items_to_project_modules',
  {
    ...timestamps,
    timelineItemId: uuid('timeline_item_id')
      .notNull()
      .references(() => TimelineItems.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    projectModuleId: uuid('project_module_id')
      .notNull()
      .references(() => ProjectModules.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.timelineItemId, table.projectModuleId] }),
  }),
)

// ________________________________________________________________________________________________
// RELATIONS
// ________________________________________________________________________________________________

export const usersRelations = relations(Users, ({ one, many }) => ({
  projects: many(Projects),
  sessions: many(Sessions),
  connections: many(Connections),
  roles: many(UserRoles),
  password: one(Passwords, {
    fields: [Users.id],
    references: [Passwords.userId],
  }),
}))

export const projectsRelations = relations(Projects, ({ one, many }) => ({
  user: one(Users, {
    fields: [Projects.userId],
    references: [Users.id],
  }),
  modules: many(ProjectModules),
  functionalities: many(ProjectFunctionalities),
  chats: many(Chats),
  timeline: one(ProjectTimelines, {
    fields: [Projects.id],
    references: [ProjectTimelines.projectId],
  }),
}))

export const projectModulesRelations = relations(
  ProjectModules,
  ({ one, many }) => ({
    project: one(Projects, {
      fields: [ProjectModules.projectId],
      references: [Projects.id],
    }),
    generalModule: one(GeneralModules, {
      fields: [ProjectModules.generalModuleId],
      references: [GeneralModules.id],
    }),
    functionalities: many(ProjectFunctionalities, {
      relationName: 'projectModule_functionalities',
    }),
    moduleTime: one(ModuleTime, {
      fields: [ProjectModules.id],
      references: [ModuleTime.projectModuleId],
    }),
    timelineItemToProjectModules: many(TimelineItemsToProjectModules),
  }),
)

export const projectFunctionalitiesRelations = relations(
  ProjectFunctionalities,
  ({ one, many }) => ({
    project: one(Projects, {
      fields: [ProjectFunctionalities.projectId],
      references: [Projects.id],
    }),
    projectModule: one(ProjectModules, {
      fields: [ProjectFunctionalities.projectModuleId],
      references: [ProjectModules.id],
      relationName: 'projectModule_functionalities',
    }),
    functionalityTime: one(FunctionalityTime, {
      fields: [ProjectFunctionalities.id],
      references: [FunctionalityTime.projectFunctionalityId],
    }),
    functionPoints: one(FunctionPoints, {
      fields: [ProjectFunctionalities.id],
      references: [FunctionPoints.projectFunctionalityId],
    }),
    testCases: many(TestCases),
  }),
)

export const testCasesRelations = relations(TestCases, ({ one }) => ({
  projectFunctionality: one(ProjectFunctionalities, {
    fields: [TestCases.projectFunctionalityId],
    references: [ProjectFunctionalities.id],
  }),
}))

export const complexityAssessmentCriteriaRelations = relations(
  ComplexityAssessmentCriteria,
  ({ one }) => ({
    functionalityTime: one(FunctionalityTime, {
      fields: [ComplexityAssessmentCriteria.functionalityTimeId],
      references: [FunctionalityTime.id],
    }),
  }),
)

export const chatsRelations = relations(Chats, ({ one }) => ({
  project: one(Projects, {
    fields: [Chats.projectId],
    references: [Projects.id],
  }),
  user: one(Users, {
    fields: [Chats.userId],
    references: [Users.id],
  }),
}))

// Add these relations at the end of the file:

export const passwordsRelations = relations(Passwords, ({ one }) => ({
  user: one(Users, {
    fields: [Passwords.userId],
    references: [Users.id],
  }),
}))

export const sessionsRelations = relations(Sessions, ({ one }) => ({
  user: one(Users, {
    fields: [Sessions.userId],
    references: [Users.id],
  }),
}))

export const rolesRelations = relations(Roles, ({ many }) => ({
  userRoles: many(UserRoles),
  rolePermissions: many(RolePermissions),
}))

export const permissionsRelations = relations(Permissions, ({ many }) => ({
  rolePermissions: many(RolePermissions),
}))

export const userRolesRelations = relations(UserRoles, ({ one }) => ({
  user: one(Users, {
    fields: [UserRoles.userId],
    references: [Users.id],
  }),
  role: one(Roles, {
    fields: [UserRoles.roleId],
    references: [Roles.id],
  }),
}))

export const rolePermissionsRelations = relations(
  RolePermissions,
  ({ one }) => ({
    role: one(Roles, {
      fields: [RolePermissions.roleId],
      references: [Roles.id],
    }),
    permission: one(Permissions, {
      fields: [RolePermissions.permissionId],
      references: [Permissions.id],
    }),
  }),
)

export const connectionsRelations = relations(Connections, ({ one }) => ({
  user: one(Users, {
    fields: [Connections.userId],
    references: [Users.id],
  }),
}))

export const generalModulesRelations = relations(
  GeneralModules,
  ({ many }) => ({
    projectModules: many(ProjectModules),
  }),
)

export const functionPointsRelations = relations(FunctionPoints, ({ one }) => ({
  projectFunctionality: one(ProjectFunctionalities, {
    fields: [FunctionPoints.projectFunctionalityId],
    references: [ProjectFunctionalities.id],
  }),
}))

export const functionalityTimeRelations = relations(
  FunctionalityTime,
  ({ one, many }) => ({
    projectFunctionality: one(ProjectFunctionalities, {
      fields: [FunctionalityTime.projectFunctionalityId],
      references: [ProjectFunctionalities.id],
    }),
    assessmentCriteria: many(ComplexityAssessmentCriteria),
  }),
)

export const moduleTimeRelations = relations(ModuleTime, ({ one }) => ({
  projectModule: one(ProjectModules, {
    fields: [ModuleTime.projectModuleId],
    references: [ProjectModules.id],
  }),
}))

export const projectTimelinesRelations = relations(
  ProjectTimelines,
  ({ one, many }) => ({
    project: one(Projects, {
      fields: [ProjectTimelines.projectId],
      references: [Projects.id],
    }),
    timelineItems: many(TimelineItems),
  }),
)

export const timelineItemsRelations = relations(
  TimelineItems,
  ({ one, many }) => ({
    projectTimeline: one(ProjectTimelines, {
      fields: [TimelineItems.projectTimelineId],
      references: [ProjectTimelines.id],
    }),
    timelineItemToProjectModules: many(TimelineItemsToProjectModules),
  }),
)

export const timelineItemsToProjectModulesRelations = relations(
  TimelineItemsToProjectModules,
  ({ one }) => ({
    timelineItem: one(TimelineItems, {
      fields: [TimelineItemsToProjectModules.timelineItemId],
      references: [TimelineItems.id],
    }),
    projectModule: one(ProjectModules, {
      fields: [TimelineItemsToProjectModules.projectModuleId],
      references: [ProjectModules.id],
    }),
  }),
)
