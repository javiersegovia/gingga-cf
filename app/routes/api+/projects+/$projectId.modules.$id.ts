import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { UpdateProjectModuleSchema } from '@/schemas/project-schema'
import { ProjectModuleService } from '@/.server/services/project-module-service'

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  await requireUserId(request, context)

  const { projectId, id: moduleId } = params
  if (!projectId || !moduleId) {
    throw new Error('Project ID and Module ID are required')
  }

  const { getProjectModuleById } = new ProjectModuleService(context.db)

  const projectModule = await getProjectModuleById(projectId, moduleId)

  if (!projectModule) {
    throw json({ error: 'Project module not found' }, { status: 404 })
  }

  // const { complexityMetricScore, estimatedHours } = await calculateModuleMetrics(moduleId)

  return json(projectModule)
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireUserId(request, context)

  const { projectId, id: moduleId } = params
  if (!projectId || !moduleId) {
    return json(
      { error: 'Project ID and Module ID are required' },
      { status: 400 },
    )
  }

  const { updateProjectModuleById, deleteProjectModuleById } =
    new ProjectModuleService(context.db)

  if (request.method === 'PUT') {
    const jsonData = await request.json()
    const result = UpdateProjectModuleSchema.safeParse(jsonData)

    if (!result.success) {
      return json({ error: result.error.format() }, { status: 400 })
    }

    try {
      const updatedModule = await updateProjectModuleById(
        projectId,
        moduleId,
        result.data,
      )

      return json({ module: updatedModule })
    } catch (error) {
      console.error(error)
      return json({ error: 'Failed to update project module' }, { status: 500 })
    }
  } else if (request.method === 'DELETE') {
    try {
      await deleteProjectModuleById(projectId, moduleId)

      return json({ success: true })
    } catch (error) {
      console.error(error)
      return json({ error: 'Failed to delete project module' }, { status: 500 })
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405 })
}
