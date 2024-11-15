import { ProjectFunctionalities, FunctionalityTime } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { generateFunctionalitiesByProjectModuleId } from '@/.server/ai/generate-project-functionalities'
import type {
  Functionality,
  FunctionalityTimeUpdate,
  UpdateFunctionality,
} from '@/schemas/project-schema'
import { AppLoadContext } from '@remix-run/cloudflare'

export class ProjectFunctionalityService {
  db: AppLoadContext['db']

  constructor(private context: AppLoadContext) {
    this.db = context.db
  }

  public getFunctionalityById = async (id: string) => {
    return this.db.query.ProjectFunctionalities.findFirst({
      where: eq(ProjectFunctionalities.id, id),
      columns: {
        id: true,
        name: true,
        description: true,
        type: true,
        acceptanceCriteria: true,
      },
      with: {
        projectModule: {
          columns: {
            name: true,
          },
        },
        functionalityTime: {
          columns: {
            estimatedHours: true,
            actualHours: true,
            complexityMetricScore: true,
            complexityExplanation: true,
            fpaEstimate: true,
            finalEstimate: true,
          },
          with: {
            assessmentCriteria: {
              columns: {
                score: true,
                justification: true,
                type: true,
              },
            },
          },
        },
      },
    })
  }

  public getFunctionalitiesByProjectModuleId(
    projectId: string,
    moduleId: string,
  ) {
    return this.db.query.ProjectFunctionalities.findMany({
      where: and(
        eq(ProjectFunctionalities.projectId, projectId),
        eq(ProjectFunctionalities.projectModuleId, moduleId),
      ),
    })
  }

  public createFunctionality = async ({
    projectId,
    moduleId,
    data,
  }: {
    projectId: string
    moduleId: string
    data: Functionality
  }) => {
    const [functionality] = await this.db
      .insert(ProjectFunctionalities)
      .values({
        ...data,
        projectId,
        projectModuleId: moduleId,
      })
      .returning()

    return functionality
  }

  public updateFunctionality = async ({
    projectId,
    functionalityId,
    data,
  }: {
    projectId: string
    functionalityId: string
    data: UpdateFunctionality
  }) => {
    const { functionalityTime, ...functionalityData } = data

    const [updatedFunctionality] = await this.db
      .update(ProjectFunctionalities)
      .set(functionalityData)
      .where(
        and(
          eq(ProjectFunctionalities.id, functionalityId),
          eq(ProjectFunctionalities.projectId, projectId),
        ),
      )
      .returning()

    if (functionalityTime) {
      await this.db
        .insert(FunctionalityTime)
        .values({
          projectFunctionalityId: functionalityId,
          ...functionalityTime,
        })
        .onConflictDoUpdate({
          target: FunctionalityTime.projectFunctionalityId,
          set: functionalityTime,
        })
        .returning()
    }

    return updatedFunctionality
  }

  public deleteFunctionality = ({
    projectId,
    functionalityId,
  }: {
    projectId: string
    functionalityId: string
  }) => {
    return this.db
      .delete(ProjectFunctionalities)
      .where(
        and(
          eq(ProjectFunctionalities.id, functionalityId),
          eq(ProjectFunctionalities.projectId, projectId),
        ),
      )
  }

  public generateFunctionalities = async ({
    projectId,
    moduleId,
  }: {
    projectId: string
    moduleId: string
  }) => {
    const project = await this.db.query.Projects.findFirst({
      where: eq(ProjectFunctionalities.id, projectId),
      columns: {
        id: true,
        description: true,
        mainObjective: true,
        metadata: true,
      },
    })

    const projectModule = await this.db.query.ProjectModules.findFirst({
      where: and(
        eq(ProjectFunctionalities.id, moduleId),
        eq(ProjectFunctionalities.projectId, projectId),
      ),
      columns: {
        id: true,
        name: true,
        description: true,
        additionalInfo: true,
      },
    })

    if (!project || !projectModule) {
      throw new Error('Project or module not found')
    }

    const generatedFunctionalities =
      await generateFunctionalitiesByProjectModuleId(
        this.context,
        project,
        projectModule,
      )

    return generatedFunctionalities
  }

  public updateFunctionalityTime = async (
    functionalityId: string,
    data: FunctionalityTimeUpdate,
  ) => {
    const [updatedTime] = await this.db
      .insert(FunctionalityTime)
      .values({
        projectFunctionalityId: functionalityId,
        ...data,
      })
      .onConflictDoUpdate({
        target: FunctionalityTime.projectFunctionalityId,
        set: data,
      })
      .returning()

    return updatedTime
  }
}
