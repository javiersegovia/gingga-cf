import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { ProjectFunctionalityService } from '@/.server/services/project-functionality-service'
import { UpdateFunctionalitySchema } from '@/schemas/project-schema'
import { ProjectModuleService } from '@/.server/services/project-module-service'
import { ModuleTime, ProjectFunctionalities } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  await requireUserId(request, context)

  const { projectId, id: functionalityId } = params
  if (!projectId || !functionalityId) {
    throw new Error('Project ID and Functionality ID are required')
  }

  const { getFunctionalityById } = new ProjectFunctionalityService(context.db)

  const functionality = await getFunctionalityById(functionalityId)

  if (!functionality) {
    throw json({ error: 'Functionality not found' }, { status: 404 })
  }

  return json(functionality)
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireUserId(request, context)

  const { projectId, id: functionalityId } = params
  if (!projectId || !functionalityId) {
    return json(
      { error: 'Project ID and Functionality ID are required' },
      { status: 400 },
    )
  }

  const { updateFunctionality, deleteFunctionality } =
    new ProjectFunctionalityService(context.db)

  if (request.method === 'PUT') {
    const jsonData = await request.json()
    const result = UpdateFunctionalitySchema.safeParse(jsonData)

    if (!result.success) {
      return json({ error: result.error.format() }, { status: 400 })
    }

    try {
      if (result.data) {
        await updateFunctionality({
          projectId,
          functionalityId,
          data: result.data,
        })
      }

      const functionality = await context.db
        .select({ projectModuleId: ProjectFunctionalities.projectModuleId })
        .from(ProjectFunctionalities)
        .where(eq(ProjectFunctionalities.id, functionalityId))
        .limit(1)
        .then((rows) => rows[0])

      if (!functionality) {
        throw json({ error: 'Module not found' }, { status: 404 })
      }

      const { calculateModuleMetrics } = new ProjectModuleService(context.db)

      const { estimatedHours, complexityMetricScore } =
        await calculateModuleMetrics(functionality.projectModuleId)

      await context.db
        .insert(ModuleTime)
        .values({
          projectModuleId: functionality.projectModuleId,
          complexityMetricScore,
          estimatedHours,
        })
        .onConflictDoUpdate({
          target: ModuleTime.projectModuleId,
          set: {
            complexityMetricScore,
            estimatedHours,
          },
        })

      return json({ success: true })
    } catch (error) {
      console.error(error)
      return json({ error: 'Failed to update functionality' }, { status: 500 })
    }
  } else if (request.method === 'DELETE') {
    try {
      await deleteFunctionality({ projectId, functionalityId })

      return json({ success: true })
    } catch (error) {
      console.error(error)
      return json({ error: 'Failed to delete functionality' }, { status: 500 })
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405 })
}
