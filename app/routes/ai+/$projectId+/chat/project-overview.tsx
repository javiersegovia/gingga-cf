import { cn } from '@/core/utils'
import type { GetProjectResponse } from '@/queries/use-project-query'
import { Clock, Brain, HardDrive, PackageIcon } from 'lucide-react'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

type ProjectOverviewProps = {
  projectStats: GetProjectResponse['projectStats']
}

export function ProjectOverview({ projectStats }: ProjectOverviewProps) {
  const {
    totalEstimatedHours,
    complexityMetricScore,
    totalFunctionalities,
    totalModules,
  } = projectStats

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-2 z-10 text-neutral-400">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                totalModules > 0
                  ? 'bg-gray-800'
                  : 'bg-transparent border-gray-800 border',
              )}
            >
              <PackageIcon className="text-pink-500 w-5 h-5" />
              {totalModules > 0 && <span>{totalModules}</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="bottom">
            <p>Total number of modules in the project.</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                totalFunctionalities > 0
                  ? 'bg-gray-800'
                  : 'bg-transparent border-gray-800 border',
              )}
            >
              <HardDrive className="text-yellow-400 w-5 h-5" />
              {totalFunctionalities > 0 && <span>{totalFunctionalities}</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="bottom">
            <p>Total number of functionalities across all modules.</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                totalEstimatedHours
                  ? 'bg-gray-800'
                  : 'bg-transparent border-gray-800 border',
              )}
            >
              <Clock className="text-emerald-400 w-5 h-5" />
              {!!totalEstimatedHours && <span>{totalEstimatedHours}h</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-2" side="bottom">
            <p>Total estimated time to implement all modules.</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                complexityMetricScore
                  ? 'bg-gray-800'
                  : 'bg-transparent border-gray-800 border',
              )}
            >
              <Brain className="text-sky-400 w-5 h-5" />
              {!!complexityMetricScore && <span>{complexityMetricScore}</span>}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-2" side="bottom">
            <p>Average complexity level across all modules.</p>
            {!!complexityMetricScore && (
              <p className="text-yellow-400">
                Score: {complexityMetricScore} out of 10
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
