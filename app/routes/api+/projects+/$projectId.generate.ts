import { json } from '@remix-run/cloudflare'
import type { ActionFunctionArgs } from '@remix-run/cloudflare'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { ProjectFunctionalityService } from '@/.server/services/project-functionality-service'
import { z } from 'zod'

const GenerateFunctionalitiesSchema = z.object({
  intent: z.literal('generate-functionalities'),
  moduleId: z.string(),
})

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireUserId(request, context)

  const projectId = params.projectId
  if (!projectId) {
    return json({ error: 'Project ID is required' }, { status: 400 })
  }

  try {
    const jsonData = await request.json()
    const result = GenerateFunctionalitiesSchema.safeParse(jsonData)

    if (!result.success) {
      return json({ error: 'Invalid request format' }, { status: 400 })
    }

    const { moduleId } = result.data

    const { generateFunctionalities } = new ProjectFunctionalityService(context)

    const generatedFunctionalities = await generateFunctionalities({
      projectId,
      moduleId,
    })

    return json({ functionalities: generatedFunctionalities })
  } catch (error) {
    console.error('Error in AI action:', error)
    throw json('An error occurred while processing the request', {
      status: 500,
    })
  }
}
