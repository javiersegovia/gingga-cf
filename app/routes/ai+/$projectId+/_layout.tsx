import { ProjectService } from '@/.server/services/project-service'
import { Chat } from '@/components/chat/chat'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { cn } from '@/core/utils'
import { invariantResponse } from '@epic-web/invariant'
import { json } from '@remix-run/cloudflare'
import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { CircleGaugeIcon, PhoneIcon, Undo2Icon } from 'lucide-react'
import {
  useGenerateTimelineMutation,
  useTimelineQuery,
} from '@/queries/use-project-query'
import { Timeline } from '@/components/ui/timeline'

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, context)

  const projectId = params.projectId
  invariantResponse(projectId, 'Project ID is required', { status: 400 })

  const { getProjects } = new ProjectService(context)

  const projects = await getProjects(userId)

  // Check if timeline exists
  const timeline = await context.db.query.ProjectTimelines.findFirst({
    where: (pt, { eq }) => eq(pt.projectId, projectId),
  })

  const hasTimeline = Boolean(timeline)

  return json({ projectId, projects, hasTimeline })
}

export type LayoutContextType = {
  project: Awaited<ReturnType<typeof ProjectService.prototype.getProjectById>>
}

export default function AIWizardLayout() {
  const { projectId, hasTimeline: initialHasTimeline } =
    useLoaderData<typeof loader>()
  const [showTimeline, setShowTimeline] = useState(false)

  // Query the timeline data
  const { data: timelineData } = useTimelineQuery(projectId)

  // Get the mutation function for generating timeline
  const { mutate: generateTimeline, isPending } =
    useGenerateTimelineMutation(projectId)

  // Use the timeline data to determine if we have a timeline
  const hasTimeline = timelineData?.timeline != null || initialHasTimeline

  const handleTimelineClick = () => {
    if (showTimeline) {
      // Remove timeline param to go back
      setShowTimeline(false)
    } else if (hasTimeline) {
      // Show existing timeline
      setShowTimeline(true)
    } else {
      // Generate new timeline
      generateTimeline(undefined, {
        onSuccess: () => {
          setShowTimeline(true)
        },
      })
    }
  }

  const location = useLocation()

  useEffect(() => {
    setShowTimeline(false)
  }, [location.pathname])

  return (
    <>
      <div className="flex items-stretch h-screen overflow-hidden w-full divide-x divide-gray-800">
        <div className="w-2/5 flex bg-black">
          <Chat />
        </div>

        <div className="w-3/5 flex-1 flex flex-col relative bg-black/50">
          {showTimeline ? (
            <>
              <Timeline projectId={projectId} />
            </>
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar overflow-hidden">
              <Outlet />
            </div>
          )}

          <div
            className={cn(
              'flex justify-center gap-4 backdrop-blur-[2px] items-center h-32 border-t bg-gray-900 border-gray-800',
            )}
          >
            <Button
              variant="outline"
              size="xl"
              onClick={handleTimelineClick}
              disabled={isPending}
              className={cn(
                'font-medium border border-gray-700 hover:text-white',
                !showTimeline && 'bg-gray-950 hover:bg-black text-white',
                isPending && 'opacity-50 cursor-not-allowed',
              )}
            >
              {showTimeline ? (
                <>
                  <Undo2Icon className="w-5 h-5 mr-4" />
                  <span>Back</span>
                </>
              ) : hasTimeline ? (
                <>
                  <CircleGaugeIcon className="w-6 h-6 mr-4 text-lime-400" />
                  <span>See Roadmap</span>
                </>
              ) : (
                <>
                  <CircleGaugeIcon className="w-6 h-6 mr-4 text-lime-400" />
                  <span>
                    {isPending ? 'Generating...' : 'Generate Roadmap'}
                  </span>
                </>
              )}
            </Button>

            {/* <Link to="/book-call" className="inline-block"> */}
            <Button
              variant="outline"
              size="xl"
              className={cn(
                'font-medium border border-gray-700 hover:text-white',
                showTimeline && 'bg-gray-950 hover:bg-black text-white',
              )}
            >
              <PhoneIcon
                className={cn('w-5 h-5 mr-4', showTimeline && 'text-lime-400')}
              />
              <span>Book a call</span>
            </Button>
            {/* </Link> */}
          </div>
        </div>
      </div>
    </>
  )
}
