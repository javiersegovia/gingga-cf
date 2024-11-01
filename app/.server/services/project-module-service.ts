// import type { ObjectivesSchema } from '@/routes/ai+/$projectId+/chat/objectives.schema'
import {
  ProjectFunctionalities,
  ProjectModules,
  ModuleTime,
  FunctionalityTime,
} from '@/db/schema'
import type { z } from 'zod'
import { generateProjectModules } from '@/.server/ai/generate-project-modules'
import { eq, and, not, inArray } from 'drizzle-orm'
import type {
  ObjectivesSchema,
  UpdateProjectModule,
} from '@/schemas/project-schema'
import { AppLoadContext } from '@remix-run/cloudflare'

export class ProjectModuleService {
  db: AppLoadContext['db']

  constructor(private context: AppLoadContext) {
    this.db = context.db
  }

  public createProjectModules = async (
    projectId: string,
    data: z.infer<typeof ObjectivesSchema>,
  ) => {
    const { mainObjective, metadata } = data

    const projectModules = await generateProjectModules(this.context, {
      mainObjective,
      metadata,
    })

    console.log('openAI response')
    console.log(projectModules)

    await this.db.insert(ProjectModules).values(
      projectModules.map((module) => ({
        ...module,
        projectId,
      })),
    )

    return true
  }

  public getProjectModules = (projectId: string) => {
    return this.db.query.ProjectModules.findMany({
      where: eq(ProjectModules.projectId, projectId),
      with: {
        functionalities: {
          columns: {
            id: true,
            name: true,
          },
          with: {
            testCases: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  }

  public getProjectModuleById = (projectId: string, moduleId: string) => {
    return this.db.query.ProjectModules.findFirst({
      where: and(
        eq(ProjectModules.projectId, projectId),
        eq(ProjectModules.id, moduleId),
      ),
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
          },
          with: {
            functionalityTime: {
              columns: {
                id: true,
                complexityMetricScore: true,
                complexityExplanation: true,
                estimatedHours: true,
                actualHours: true,
                fpaEstimate: true,
              },
            },
            testCases: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
  }

  public updateProjectModules = (
    projectId: string,
    newModules: UpdateProjectModuleInput[],
  ) => {
    return this.db.transaction(async (tx) => {
      // Delete modules not in the new list
      await tx
        .delete(ProjectModules)
        .where(
          and(
            eq(ProjectModules.projectId, projectId),
            not(
              inArray(
                ProjectModules.id,
                newModules.map((m) => m.id).filter(Boolean) as string[],
              ),
            ),
          ),
        )

      // Update or create modules
      for (const module of newModules) {
        if (module.id) {
          await tx
            .update(ProjectModules)
            .set({
              name: module.name,
              description: module.description,
            })
            .where(eq(ProjectModules.id, module.id))
        } else {
          await tx.insert(ProjectModules).values({
            projectId,
            name: module.name,
            description: module.description,
          })
        }
      }
    })
  }

  public deleteProjectModules = (projectId: string, moduleIds: string[]) => {
    return this.db
      .delete(ProjectModules)
      .where(
        and(
          eq(ProjectModules.projectId, projectId),
          inArray(ProjectModules.id, moduleIds),
        ),
      )
  }

  public deleteProjectModuleById = (projectId: string, moduleId: string) => {
    return this.db
      .delete(ProjectModules)
      .where(
        and(
          eq(ProjectModules.projectId, projectId),
          eq(ProjectModules.id, moduleId),
        ),
      )
  }

  public updateProjectModuleById = (
    projectId: string,
    moduleId: string,
    data: UpdateProjectModule,
  ) => {
    return this.db.transaction(async (tx) => {
      const { moduleTime, ...moduleData } = data

      await tx
        .update(ProjectModules)
        .set(moduleData)
        .where(
          and(
            eq(ProjectModules.projectId, projectId),
            eq(ProjectModules.id, moduleId),
          ),
        )

      if (moduleTime) {
        await tx
          .insert(ModuleTime)
          .values({
            projectModuleId: moduleId,
            ...moduleTime,
          })
          .onConflictDoUpdate({
            target: ModuleTime.projectModuleId,
            set: moduleTime,
          })
      }

      return true
    })
  }

  public calculateModuleMetrics = async (moduleId: string) => {
    const functionalities = await this.db
      .select({
        id: ProjectFunctionalities.id,
        complexityMetricScore: FunctionalityTime.complexityMetricScore,
        estimatedHours: FunctionalityTime.estimatedHours,
      })
      .from(ProjectFunctionalities)
      .leftJoin(
        FunctionalityTime,
        eq(ProjectFunctionalities.id, FunctionalityTime.projectFunctionalityId),
      )
      .where(eq(ProjectFunctionalities.projectModuleId, moduleId))

    if (functionalities.length === 0) {
      return {
        complexityMetricScore: 0,
        estimatedHours: 0,
      }
    }

    const totals = functionalities.reduce(
      (acc, functionality) => ({
        complexityMetricScore:
          acc.complexityMetricScore +
          (functionality.complexityMetricScore || 0),
        estimatedHours:
          acc.estimatedHours + (functionality.estimatedHours || 0),
      }),
      { complexityMetricScore: 0, estimatedHours: 0 },
    )

    return {
      complexityMetricScore:
        Math.round(
          (totals.complexityMetricScore / functionalities.length) * 100,
        ) / 100,
      estimatedHours: Math.round(totals.estimatedHours * 100) / 100,
    }
  }
}

type UpdateProjectModuleInput = Omit<
  typeof ProjectModules.$inferInsert,
  'projectId'
>
