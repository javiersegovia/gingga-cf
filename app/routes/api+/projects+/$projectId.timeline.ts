import { json } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { generateProjectTimeline } from '@/.server/ai/generate-project-timeline'
import { ProjectTimelineService } from '@/.server/services/project-timeline-service'

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  await requireUserId(request, context)

  const { projectId } = params
  if (!projectId) {
    throw new Response('Project ID is required', { status: 400 })
  }

  const { getProjectTimeline } = new ProjectTimelineService(context.db)

  const timeline = await getProjectTimeline(projectId)

  return json({ timeline })
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireUserId(request, context)

  const { projectId } = params

  if (!projectId) {
    throw json({ error: 'Project ID is required' }, { status: 400 })
  }

  if (request.method !== 'POST') {
    throw json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const timeline = await generateProjectTimeline(context, projectId)
    return json({ timeline })
  } catch (error) {
    console.error('Timeline generation error:', error)
    throw json({ error: 'Failed to generate timeline' }, { status: 500 })
  }
}
