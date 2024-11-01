import { json } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { ProjectService } from '@/.server/services/project-service'
import { ProjectUpdateSchema } from '@/schemas/project-schema'
import { requireUserId } from '@/core/auth/auth-utils.server'

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, context)

  const projectId = params.projectId
  if (!projectId) {
    throw new Error('Project ID is required')
  }

  const { getProjectWithModules, getProjectStats } = new ProjectService(context)

  const project = await getProjectWithModules(projectId)

  if (!project) {
    throw new Error('Project not found')
  }

  if (project.userId !== userId) {
    throw new Error('Unauthorized')
  }

  const projectStats = getProjectStats(project)

  return json({ project, projectStats })
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request, context)

  const projectId = params.projectId
  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 })
  }

  const { updateProject, deleteProject } = new ProjectService(context)

  if (request.method.toUpperCase() === 'PUT') {
    const data = await request.json()
    const result = ProjectUpdateSchema.safeParse(data)

    if (!result.success) {
      return json({ result: result.error.format() }, { status: 400 })
    }

    try {
      const [updatedProject] = await updateProject(
        projectId,
        userId,
        result.data,
      )
      if (!updatedProject) {
        return json({ error: 'Failed to update project' }, { status: 500 })
      }

      return json({ project: updatedProject })
    } catch (error) {
      console.error(error)
      return json({ error: 'Failed to update project' }, { status: 500 })
    }
  } else if (request.method.toUpperCase() === 'DELETE') {
    try {
      await deleteProject(projectId, userId)
      return json({ success: true })
    } catch (error) {
      console.error(error)
      return json({ error: 'Failed to delete project' }, { status: 500 })
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405 })
}
