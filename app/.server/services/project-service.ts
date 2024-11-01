import type { ProjectUpdate } from '@/schemas/project-schema'
import {
  type ModuleTime,
  ProjectModules,
  Projects,
  type ProjectFunctionalities,
} from '@/db/schema'
import { eq, and, isNull, desc, or, ilike, count } from 'drizzle-orm'
import { generateProjectData } from '@/.server/ai/generate-project-data'
import { AppLoadContext } from '@remix-run/cloudflare'

// Define ProjectWithModules type
export type ProjectWithModules = Pick<
  typeof Projects.$inferSelect,
  'id' | 'name' | 'description' | 'mainObjective' | 'metadata' | 'userId'
> & {
  modules: Pick<
    typeof ProjectModules.$inferSelect,
    'id' | 'description' | 'name' | 'additionalInfo'
  >[]
}

// Define ProjectTaskInput type
export type ProjectFunctionalitiesInput = Omit<
  typeof ProjectFunctionalities.$inferSelect,
  'id' | 'createdAt' | 'updatedAt'
>

type GetProjectStatsArgs = {
  modules: Array<
    Pick<typeof ProjectModules.$inferSelect, 'id'> & {
      moduleTime: Pick<
        typeof ModuleTime.$inferSelect,
        'estimatedHours' | 'complexityMetricScore'
      >
      functionalities: Array<
        Pick<typeof ProjectFunctionalities.$inferSelect, 'id'>
      >
    }
  >
}

export class ProjectService {
  constructor(private db: AppLoadContext['db']) {}

  public createProject = async (userId: string, productDescription: string) => {
    const projectData = await generateProjectData(productDescription)

    const { name, description, mainObjective, metadata } = projectData

    const id = await this.db.transaction(async (tx) => {
      const [project] = await tx
        .insert(Projects)
        .values({
          name,
          description,
          mainObjective,
          userId,
          metadata: JSON.stringify(metadata),
        })
        .returning({ id: Projects.id })

      if (!project) throw new Error('Failed to create project')
      if (!projectData.modules) throw new Error('Failed to create project')

      if (projectData.modules) {
        await tx
          .insert(ProjectModules)
          .values(
            projectData.modules?.map(
              (module, index) =>
                module && { ...module, projectId: project.id, order: index },
            ),
          )
          .returning({ id: ProjectModules.id })
      }

      return project.id
    })

    return { id }
  }

  public getProjects = (userId: string) => {
    return this.db
      .select()
      .from(Projects)
      .where(and(eq(Projects.userId, userId), isNull(Projects.deletedAt)))
      .orderBy(desc(Projects.updatedAt))
  }

  public getProjectById = (projectId?: string) => {
    if (!projectId) return null
    return this.db.query.Projects.findFirst({
      where: and(eq(Projects.id, projectId), isNull(Projects.deletedAt)),
      with: {
        modules: {
          columns: {
            id: true,
            name: true,
            description: true,
            additionalInfo: true,
          },
        },
      },
    })
  }

  public getProjectWithModules = async (projectId: string) => {
    const result = await this.db.query.Projects.findFirst({
      where: eq(Projects.id, projectId),
      columns: {
        id: true,
        name: true,
        description: true,
        mainObjective: true,
        metadata: true,
        userId: true,
      },
      with: {
        modules: {
          orderBy: (ProjectModules, { asc }) => [asc(ProjectModules.order)],
          columns: {
            id: true,
            description: true,
            name: true,
            additionalInfo: true,
          },
          with: {
            moduleTime: {
              columns: {
                id: true,
                estimatedHours: true,
                actualHours: true,
                complexityMetricScore: true,
                fpaEstimate: true,
                finalEstimate: true,
              },
            },
            functionalities: {
              columns: {
                id: true,
                name: true,
                description: true,
              },
              with: {
                functionalityTime: {
                  columns: {
                    id: true,
                    complexityMetricScore: true,
                    estimatedHours: true,
                  },
                },
              },
            },
            generalModule: {
              columns: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!result) return null

    return result
  }

  public getProjectStats = ({ modules }: GetProjectStatsArgs) => {
    let totalComplexityMetricScore = 0
    let modulesWithComplexity = 0

    const totalEstimatedHours = modules.reduce((acc, module) => {
      if (module.moduleTime?.complexityMetricScore) {
        totalComplexityMetricScore += module.moduleTime.complexityMetricScore
        modulesWithComplexity++
      }
      return acc + (module.moduleTime?.estimatedHours || 0)
    }, 0)

    const totalFunctionalities = modules.reduce((acc, module) => {
      return acc + module.functionalities.length
    }, 0)

    const averageComplexityMetricScore =
      modulesWithComplexity > 0
        ? totalComplexityMetricScore / modulesWithComplexity
        : 0

    return {
      totalEstimatedHours,
      totalModules: modules.length,
      totalFunctionalities,
      complexityMetricScore: Number(averageComplexityMetricScore.toFixed(2)), // Round to 2 decimal places
    }
  }

  public updateProject = (
    id: string,
    userId: string,
    project: ProjectUpdate,
  ) => {
    return this.db
      .update(Projects)
      .set({ ...project })
      .where(and(eq(Projects.id, id), eq(Projects.userId, userId)))
      .returning()
  }

  public searchProjects = (userId: string, query: string) => {
    return this.db
      .select()
      .from(Projects)
      .where(
        and(
          eq(Projects.userId, userId),
          isNull(Projects.deletedAt),
          or(
            ilike(Projects.name, `%${query}%`),
            ilike(Projects.description, `%${query}%`),
            ilike(Projects.mainObjective, `%${query}%`),
          ),
        ),
      )
      .orderBy(desc(Projects.updatedAt))
  }

  public deleteProject = (id: string, userId: string) => {
    return this.db
      .update(Projects)
      .set({ deletedAt: new Date() })
      .where(and(eq(Projects.id, id), eq(Projects.userId, userId)))
  }

  public restoreProject = (id: string, userId: string) => {
    return this.db
      .update(Projects)
      .set({ deletedAt: null })
      .where(and(eq(Projects.id, id), eq(Projects.userId, userId)))
  }
}
