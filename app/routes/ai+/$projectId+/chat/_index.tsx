import { ProjectModuleService } from '@/.server/services/project-module-service'
import { ProjectService } from '@/.server/services/project-service'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { checkHoneypot } from '@/core/honeypot.server'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { json, redirect } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { Outlet, useParams, useSearchParams } from '@remix-run/react'
import { ObjectivesSchema } from '@/schemas/project-schema'
import { Projects } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getProjectQueryKey } from '@/queries/use-project-query'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { GeneralInformationBlockWithQuery } from './general-information-block'
import { FunctionalityBlockWithQuery } from './functionality-block'
import { cn } from '@/core/utils'
import { useSelectedFunctionality } from '@/stores/functionalities-store'
import { useEffect } from 'react'
import { ModulesBlockWithQuery } from './modules-block'

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  await requireUserId(request, context)

  const { getProjectById, getProjectWithModules, getProjectStats } =
    new ProjectService(context)

  invariantResponse(params.projectId, 'Not found', { status: 404 })
  const projectWithModules = await getProjectWithModules(params.projectId)
  invariantResponse(projectWithModules, 'Not found', { status: 404 })

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: getProjectQueryKey(params.projectId),
    initialData: {
      project: projectWithModules,
      projectStats: getProjectStats(projectWithModules),
    },
  })

  return json({
    dehydratedState: dehydrate(queryClient),
  })
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  await requireUserId(request, context)

  const formData = await request.formData()
  checkHoneypot(formData)

  const { getProjectById } = new ProjectService(context)

  const project = await getProjectById(params.projectId)
  invariantResponse(project, 'Not found', { status: 404 })

  const submission = parseWithZod(formData, {
    schema: ObjectivesSchema,
  })

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { mainObjective, metadata } = submission.value

  await context.db
    .update(Projects)
    .set({ mainObjective, metadata })
    .where(eq(Projects.id, project.id))

  const { createProjectModules } = new ProjectModuleService(context.db)
  await createProjectModules(project.id, { mainObjective, metadata })

  return redirect(`/ai/${project.id}/modules`)
}

export default function ObjectivesStepRoute() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const { functionalityId, setFunctionalityId } = useSelectedFunctionality()

  useEffect(() => {
    const pfId = searchParams.get('pf')
    if (pfId && !functionalityId) {
      setFunctionalityId(pfId)
    }
  }, [])

  if (!params.projectId) return null

  return (
    <section className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-transparent relative text-background flex gap-4 p-4 w-full flex-1 overflow-hidden">
        <section className="mx-auto flex flex-col z-10 w-2/5 ">
          <div
            className={cn(
              'bg-gray-900 p-4 border flex flex-1 flex-col h-full border-gray-800 rounded-xl overflow-y-auto custom-scrollbar',
              functionalityId && 'bg-gray-950',
            )}
          >
            {functionalityId ? (
              <FunctionalityBlockWithQuery
                projectId={params.projectId}
                functionalityId={functionalityId}
              />
            ) : (
              <GeneralInformationBlockWithQuery />
            )}
          </div>
        </section>
        <section className="mx-auto flex flex-1 z-10 flex-col relative overflow-y-auto custom-scrollbar">
          <div className="bg-gray-900 p-4 border flex flex-1 flex-col h-full border-gray-800 rounded-xl overflow-y-auto custom-scrollbar">
            <ModulesBlockWithQuery />
          </div>
        </section>
        <Outlet />
      </div>
    </section>
  )
}
