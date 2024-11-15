import { v7 as uuidv7 } from 'uuid'
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  unique,
  real,
} from 'drizzle-orm/sqlite-core'
import { relations, sql } from 'drizzle-orm'

// Helper for UUID default values
const uuidDefault = () => text('id').notNull().$defaultFn(uuidv7)

// Helper for timestamps
const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
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
export const Users = sqliteTable('users', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
})

export const Passwords = sqliteTable('passwords', {
  hash: text('hash').notNull(),
  userId: text('user_id')
    .primaryKey()
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const Sessions = sqliteTable('sessions', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  expirationDate: integer('expiration_date', { mode: 'timestamp' }).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const Permissions = sqliteTable('permissions', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  access: text('access').notNull(),
  description: text('description').default(''),
})

export const Roles = sqliteTable('roles', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').default(''),
})

export const UserRoles = sqliteTable('user_roles', {
  userId: text('user_id')
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  roleId: text('role_id')
    .notNull()
    .references(() => Roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const RolePermissions = sqliteTable(
  'role_permissions',
  {
    roleId: text('role_id')
      .notNull()
      .references(() => Roles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    permissionId: text('permission_id')
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

export const Verifications = sqliteTable(
  'verifications',
  {
    ...timestamps,
    id: uuidDefault().primaryKey(),
    type: text('type').notNull(),
    target: text('target').notNull(),
    secret: text('secret').notNull(),
    algorithm: text('algorithm').notNull(),
    digits: integer('digits').notNull(),
    period: integer('period').notNull(),
    charSet: text('char_set').notNull(),
    userId: text('user_id').references(() => Users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
  },
  (table) => ({
    targetTypeUnique: unique().on(table.target, table.type),
  }),
)

export const Connections = sqliteTable('connections', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  providerName: text('provider_name').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
})

export const Projects = sqliteTable('projects', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  userId: text('user_id').references(() => Users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  slug: text('slug').unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  mainObjective: text('main_objective').notNull(),
  specificObjectives: text('specific_objectives').notNull(),
  metadata: text('metadata', { mode: 'json' }),
})

export const ProjectModules = sqliteTable('project_modules', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => Projects.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  additionalInfo: text('additional_info'),
  order: integer('order').notNull().default(0),
  generalModuleId: text('general_module_id').references(
    () => GeneralModules.id,
  ),
})

export const ProjectFunctionalities = sqliteTable('project_functionalities', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: projectFunctionalityType }).notNull(),
  acceptanceCriteria: text('acceptance_criteria', { mode: 'json' }),
  projectId: text('project_id')
    .notNull()
    .references(() => Projects.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  projectModuleId: text('project_module_id')
    .references(() => ProjectModules.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
})

export const TestCases = sqliteTable('test_cases', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  projectFunctionalityId: text('project_functionality_id')
    .notNull()
    .references(() => ProjectFunctionalities.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
})

export const GeneralModules = sqliteTable('general_modules', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  additionalInfo: text('additional_info'),
})

export const Chats = sqliteTable('chats', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  message: text('message').notNull(),
  sender: text('sender', { enum: sender }).notNull(),
  projectId: text('project_id')
    .notNull()
    .references(() => Projects.id),
  userId: text('user_id')
    .notNull()
    .references(() => Users.id),
})

export const FunctionPoints = sqliteTable('function_points', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  projectFunctionalityId: text('project_functionality_id')
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

export const ModuleTime = sqliteTable('module_time', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  projectModuleId: text('project_module_id')
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

export const FunctionalityTime = sqliteTable('functionality_time', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  projectFunctionalityId: text('project_functionality_id')
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

export const ComplexityAssessmentCriteria = sqliteTable(
  'complexity_assessment_criteria',
  {
    ...timestamps,
    id: uuidDefault().primaryKey(),
    type: text('type', { enum: complexityAssessmentCriterionType }).notNull(),
    score: real('score').notNull(),
    justification: text('justification').notNull(),

    functionalityTimeId: text('functionality_time_id')
      .notNull()
      .references(() => FunctionalityTime.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
)

export const ProjectTimelines = sqliteTable('project_timelines', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => Projects.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .unique(),
  summary: text('summary'),
})

export const TimelineItems = sqliteTable('timeline_items', {
  ...timestamps,
  id: uuidDefault().primaryKey(),
  projectTimelineId: text('project_timeline_id')
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

export const TimelineItemsToProjectModules = sqliteTable(
  'timeline_items_to_project_modules',
  {
    ...timestamps,
    timelineItemId: text('timeline_item_id')
      .notNull()
      .references(() => TimelineItems.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    projectModuleId: text('project_module_id')
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
