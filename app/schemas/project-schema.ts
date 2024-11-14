import { z } from 'zod'
import { ProjectFunctionalities } from '@/db/schema'

export const ProjectMainObjectiveSchema = z
  .string()
  .min(1, 'Main objective is required')
  .max(400, 'Main objective must be 400 characters or less')

export const ProjectSpecificObjectiveSchema = z
  .string()
  .min(1, 'Specific objective is required')
  .max(150, 'Specific objective must be 150 characters or less')

export const ObjectivesSchema = z.object({
  mainObjective: ProjectMainObjectiveSchema,
  metadata: z.string().nullable(),
})

export const ProjectSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  mainObjective: z.string().min(1),
  specificObjectives: z.array(z.string()),
  metadata: z.string().nullable(),
  userId: z.string().cuid(),
})

export const ProjectCreateSchema = ProjectSchema.omit({ id: true })
export const ProjectUpdateSchema = ProjectSchema.partial().omit({ id: true })

export type Project = z.infer<typeof ProjectSchema>
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>

export const ProjectModuleSchema = z.object({
  id: z
    .string()
    .optional()
    .describe('Unique identifier for the project module'),
  name: z
    .string()
    .describe(
      'Name of the module - used to identify the module within the project',
    ),
  description: z
    .string()
    .describe("Detailed description of the module's purpose and functionality"),
  additionalInfo: z
    .string()
    .describe('Supplementary information, notes, or context about the module'),

  order: z
    .number()
    .int()
    .default(0)
    .describe('Order of priority. Starts from zero.'),

  generalModuleId: z
    .string()
    .nullable()
    .describe(
      'Reference to a general module template, if this module is based on one',
    ),
})

export const ProjectWithMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  mainObjective: z.string(),
  slug: z.string().optional(),
  specificObjectives: z.array(z.string()),
  targetAudience: z.string().optional(),
  technologyPreference: z.array(z.string()).optional(),
  constraints: z.record(z.string(), z.any()).optional(),
  requirements: z.record(z.string(), z.any()).optional(),
  references: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
})

export const FunctionalitySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(ProjectFunctionalities.type.enumValues),
  acceptanceCriteria: z.array(z.string()).optional(),
})

export const FunctionalityTimeSchema = z.object({
  complexityMetricScore: z.number().nullable(),
  fpaEstimate: z.number().int().nullable(),
  finalEstimate: z.number().int().nullable(),
  estimatedHours: z.number().nullable(),
  actualHours: z.number().nullable(),
})

export const UpdateFunctionalitySchema = FunctionalitySchema.partial().extend({
  functionalityTime: FunctionalityTimeSchema.optional(),
})
export type UpdateFunctionality = z.infer<typeof UpdateFunctionalitySchema>

// export const UpdateSchema = z.object({
//   functionality: UpdateFunctionalitySchema.optional(),
//   time: FunctionalityTimeSchema.optional(),
// })

export type Functionality = z.infer<typeof FunctionalitySchema>
export type FunctionalityFormData = z.infer<typeof FunctionalitySchema>
export type FunctionalityTimeUpdate = z.infer<typeof FunctionalityTimeSchema>

export const UpdateProjectModuleSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or less'),
  description: z.string().min(1, 'Description is required'),
  additionalInfo: z.string().optional(),
  moduleTime: z
    .object({
      estimatedHours: z.number().nullable(),
      actualHours: z.number().nullable(),
      complexityMetricScore: z.number().nullable(),
      fpaEstimate: z.number().nullable(),
      finalEstimate: z.number().nullable(),
    })
    .optional(),
})

export type UpdateProjectModule = z.infer<typeof UpdateProjectModuleSchema>
