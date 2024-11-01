import { json, type ActionFunctionArgs } from '@remix-run/cloudflare'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { eq } from 'drizzle-orm'
import { ProjectModules } from '@/db/schema'
import { generateComplexityMetrics } from '@/.server/ai/generate-complexity-metrics'
import { ModuleTime } from '@/db/schema'
import { ProjectModuleService } from '@/.server/services/project-module-service'

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireUserId(request, context)

  const { projectId, id: moduleId } = params
  if (!projectId || !moduleId) {
    return json(
      { error: 'Project ID and Module ID are required' },
      { status: 400 },
    )
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const projectModule = await context.db.query.ProjectModules.findFirst({
      where: eq(ProjectModules.id, moduleId),
      with: {
        functionalities: true,
      },
    })

    if (!projectModule) {
      return json({ error: 'Project module not found' }, { status: 404 })
    }

    await Promise.all(
      projectModule.functionalities.map(async (functionality) => {
        await generateComplexityMetrics(context.db, {
          projectFunctionality: functionality,
          projectModule,
        })
      }),
    )

    const { calculateModuleMetrics } = new ProjectModuleService(context.db)
    const { estimatedHours, complexityMetricScore } =
      await calculateModuleMetrics(moduleId)

    await context.db
      .insert(ModuleTime)
      .values({
        projectModuleId: moduleId,
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
    console.error('Error in complexity generation:', error)
    return json(
      { error: 'An error occurred while processing the request' },
      { status: 500 },
    )
  }
}
