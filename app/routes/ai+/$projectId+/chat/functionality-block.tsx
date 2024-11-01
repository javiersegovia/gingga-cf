import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSelectedFunctionality } from '@/stores/functionalities-store'
import {
  useFunctionalityQuery,
  useUpdateFunctionalityMutation,
} from '@/queries/use-project-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Brain,
  BrainCircuit,
  ClockIcon,
  CloudUploadIcon,
  PencilIcon,
  XIcon,
  HardDriveIcon,
  BadgeCheckIcon,
  BrainIcon,
} from 'lucide-react'
import { UpdateFunctionalitySchema } from '@/schemas/project-schema'
import type { UpdateFunctionality } from '@/schemas/project-schema'
import type { GetFunctionalityResponse } from '@/queries/use-project-query'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/core/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { DirectionAwareTabs } from '@/components/ui/direction-aware-tabs'
import { useToast } from '@/hooks/use-toast'
import { H4, P } from '@/components/ui/typography'

const FunctionalityStats = ({
  acceptanceCriteriaCount,
  complexityMetricScore,
  estimatedTime,
}: {
  acceptanceCriteriaCount: number
  complexityMetricScore?: number | null
  estimatedTime?: number | null
}) => {
  // Calculate hours per complexity score
  const hoursPerComplexity =
    estimatedTime && complexityMetricScore
      ? (estimatedTime / complexityMetricScore).toFixed(2)
      : null

  return (
    <TooltipProvider>
      <div className="flex gap-2 justify-start">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div className="bg-gray-800 rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2">
              <BadgeCheckIcon className="text-purple-500 w-5 h-5" />
              <span className="text-gray-200">{acceptanceCriteriaCount}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="bottom">
            <p>Number of acceptance criteria for this functionality.</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'bg-gray-800 rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                !complexityMetricScore &&
                  'bg-transparent border-gray-700 border',
              )}
            >
              <Brain className="text-blue-500 w-5 h-5" />
              {complexityMetricScore && (
                <span className="text-gray-200">
                  {complexityMetricScore.toFixed(2)}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-2" side="bottom">
            <p>
              Complexity score of the functionality. This measures the intricacy
              and difficulty of implementation.
            </p>
            {complexityMetricScore ? (
              <p className="text-yellow-400">
                Score: {complexityMetricScore.toFixed(2)} out of 10
              </p>
            ) : (
              <p className="text-yellow-400">Complexity score not available.</p>
            )}
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'bg-gray-800 rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                !estimatedTime && 'bg-transparent border-gray-700 border',
              )}
            >
              <ClockIcon className="text-green-500 w-5 h-5" />
              {estimatedTime && (
                <span className="text-gray-200">{estimatedTime}</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-2" side="bottom">
            <p>Estimated time to implement this functionality.</p>
            {!estimatedTime && (
              <p className="text-yellow-400">Estimated time not available.</p>
            )}
          </TooltipContent>
        </Tooltip>

        {hoursPerComplexity && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'bg-gray-800 rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                  !hoursPerComplexity &&
                    'bg-transparent border-gray-700 border',
                )}
              >
                <BrainCircuit className="text-yellow-500 w-5 h-5" />
                {hoursPerComplexity && (
                  <span className="text-gray-200">{hoursPerComplexity}</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs space-y-2" side="bottom">
              <p>Hours per complexity score.</p>
              <p>
                This is calculated by dividing the estimated time by the
                complexity score.
              </p>

              <p className="text-yellow-400">
                {hoursPerComplexity} hours per complexity point
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}

const FunctionalityDetailsAccordion = ({
  functionality,
}: {
  functionality: GetFunctionalityResponse
}) => {
  const { functionalityTime } = functionality
  const {
    complexityMetricScore,
    complexityExplanation,
    assessmentCriteria = [],
  } = functionalityTime || {}

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-gray-800 rounded-xl"
    >
      <AccordionItem value="acceptance-criteria" className="px-4 border-none">
        <AccordionTrigger className="py-3 text-gray-200 hover:no-underline">
          <div className="flex items-center gap-2">
            <BadgeCheckIcon className="text-purple-400 w-5 h-5" />
            <span
              className={cn(
                'text-gray-300/50',
                functionality.acceptanceCriteria?.length && 'text-gray-300',
              )}
            >
              {functionality.acceptanceCriteria?.length
                ? `${functionality.acceptanceCriteria?.length} Acceptance Criteria`
                : 'No acceptance criteria available'}
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <ul className="list-disc list-inside pl-2 space-y-2 text-gray-300">
            {functionality.acceptanceCriteria?.map((criteria) => (
              <li key={criteria}>{criteria}</li>
            )) || <li>No acceptance criteria available.</li>}
          </ul>
        </AccordionContent>
      </AccordionItem>

      <Separator className="bg-gray-700" />

      <AccordionItem value="complexity-score" className="px-4 border-none">
        <AccordionTrigger className="py-3 text-gray-200 hover:no-underline">
          <div className="flex items-center gap-2">
            <BrainIcon
              className={cn(
                'text-sky-400 w-5 h-5',
                !complexityMetricScore && 'opacity-40',
              )}
            />
            <span
              className={cn(
                'text-gray-400/70',
                complexityMetricScore && 'text-gray-300',
              )}
            >
              {complexityMetricScore
                ? `${complexityMetricScore.toFixed(2)} Complexity Score`
                : 'Complexity unknown'}
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="text-gray-300">
          {complexityExplanation ? (
            <>
              <p>{complexityExplanation}</p>

              <div className="space-y-4">
                {assessmentCriteria.map((criterion) => (
                  <div
                    key={criterion.type}
                    className="bg-gray-700 p-3 rounded-lg"
                  >
                    <div className="flex gap-2 items-center">
                      <P className="text-gray-300 p-1 border border-sky-400/50 from-blue-500 to-sky-700 px-2 text-sky-400 rounded-xl font-semibold text-xs">
                        {criterion.score.toFixed(2)}
                      </P>
                      <P className="text-gray-200 font-medium">
                        {criterion.type.replace(/_/g, ' ')}
                      </P>
                    </div>
                    <P className="text-gray-400 mt-2 text-sm">
                      {criterion.justification}
                    </P>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>
              Complexity metrics have not been generated for this functionality
              yet.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>

      <Separator className="bg-gray-700" />

      <AccordionItem value="estimated-time" className="px-4 border-none">
        <AccordionTrigger className="py-3 text-gray-200 hover:no-underline">
          <div className="flex items-center gap-2">
            <ClockIcon
              className={cn(
                'text-emerald-400 w-5 h-5',
                !functionality.functionalityTime && 'opacity-40',
              )}
            />
            <span
              className={cn(
                'text-gray-400/70',
                functionality.functionalityTime && 'text-gray-300',
              )}
            >
              {functionality.functionalityTime
                ? `${functionality.functionalityTime.estimatedHours} hours`
                : 'Estimated time unknown '}
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="text-gray-300">
          {functionality.functionalityTime ? (
            <p>
              Estimated time to implement this functionality:{' '}
              {functionality.functionalityTime.estimatedHours} hours
            </p>
          ) : (
            <p>
              Estimated time has not been generated for this functionality yet.
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const FunctionalityBlockSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-6 w-40 ml-4" />
        </div>
        <Skeleton className="w-8 h-8 rounded-md" />
      </div>

      <div className="flex gap-2 mb-4">
        <Skeleton className="w-16 h-8 rounded-xl" />
        <Skeleton className="w-16 h-8 rounded-xl" />
        <Skeleton className="w-16 h-8 rounded-xl" />
      </div>

      <Skeleton className="w-full h-24 rounded-xl mb-4" />

      <div className="space-y-2">
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  )
}

export const FunctionalityBlockWithQuery = ({
  projectId,
  functionalityId,
}: {
  projectId: string
  functionalityId: string
}) => {
  const { data: functionality, isLoading } = useFunctionalityQuery(
    projectId,
    functionalityId,
  )

  if (isLoading) return <FunctionalityBlockSkeleton />
  if (!functionality || 'error' in functionality)
    return <div>Functionality not found</div>

  return <FunctionalityBlock functionality={functionality} />
}

const UpdateFunctionalityForm = ({
  functionality,
  onCancel,
  onSave,
}: {
  functionality: GetFunctionalityResponse
  onCancel: () => void
  onSave: () => void
}) => {
  const { mutate: updateFunctionality, isPending } =
    useUpdateFunctionalityMutation(
      functionality.projectId,
      functionality.id,
      functionality.projectModuleId,
    )
  const { toast } = useToast()

  const form = useForm<UpdateFunctionality>({
    resolver: zodResolver(UpdateFunctionalitySchema),
    values: {
      name: functionality.name,
      description: functionality.description,
      acceptanceCriteria: functionality.acceptanceCriteria || [],
      type: functionality.type,
      functionalityTime: functionality.functionalityTime,
    },
    defaultValues: {
      name: functionality.name,
      description: functionality.description,
      acceptanceCriteria: functionality.acceptanceCriteria || [],
      type: functionality.type,
      functionalityTime: functionality.functionalityTime,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      updateFunctionality(data, {
        onSuccess: () => {
          onSave()
        },
      })
    } catch (error) {
      console.error('Failed to update functionality:', error)
      toast({
        title: 'Failed to update functionality',
        description: 'Please try again.',
        toastType: 'error',
      })
    }
  })

  const tabs = [
    {
      id: 0,
      label: 'General',
      content: (
        <div className="space-y-4 text-gray-300">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter functionality name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter functionality description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acceptanceCriteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Acceptance Criteria</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value?.join('\n')}
                    onChange={(e) => field.onChange(e.target.value.split('\n'))}
                    placeholder="Enter each acceptance criterion on a new line"
                    className="min-h-32"
                  />
                </FormControl>
                <FormMessage />
                <FormDescription>
                  Enter each acceptance criterion on a new line. This will be
                  used to generate the complexity score.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      id: 1,
      label: 'Metrics',
      content: (
        <div className="space-y-4 text-gray-300">
          <FormField
            control={form.control}
            name="functionalityTime.estimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Enter estimated hours"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="functionalityTime.actualHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Enter actual hours"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="functionalityTime.complexityMetricScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complexity Metric Score</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Enter complexity metric score"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="functionalityTime.fpaEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FPA Estimate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Enter FPA estimate"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="functionalityTime.finalEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Final Estimate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    placeholder="Enter final estimate"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
  ]

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <DirectionAwareTabs
          tabs={tabs}
          className="bg-gray-800"
          rounded="rounded-xl"
        />

        <div className="mt-4 flex justify-end space-x-2">
          <Button size="default" variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            size="default"
            variant="save"
            type="submit"
            disabled={isPending}
          >
            <CloudUploadIcon className="h-4 w-4 mr-2" />
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

const FunctionalityBlock = ({
  functionality,
}: {
  functionality: GetFunctionalityResponse
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const { setFunctionalityId } = useSelectedFunctionality()

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 border border-gray-700 rounded-xl">
            <HardDriveIcon className="text-yellow-400 w-5 h-5" />
          </div>
          <H4 className="text-base pl-4 text-gray-200 font-normal">
            {isEditing ? 'Edit Functionality' : functionality.name}
          </H4>
        </div>

        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsEditing(true)
              }}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false)
              } else {
                setFunctionalityId(null)
              }
            }}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isEditing && (
        <>
          <FunctionalityStats
            acceptanceCriteriaCount={
              functionality.acceptanceCriteria?.length || 0
            }
            complexityMetricScore={
              functionality.functionalityTime?.complexityMetricScore
            }
            estimatedTime={functionality.functionalityTime?.estimatedHours}
          />
          <div className="pt-4" />
        </>
      )}

      {isEditing ? (
        <UpdateFunctionalityForm
          functionality={functionality}
          onCancel={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      ) : (
        <>
          <p className="text-gray-300 text-sm bg-gray-800 p-4 rounded-xl mb-4">
            {functionality.description}
          </p>
          <FunctionalityDetailsAccordion functionality={functionality} />
        </>
      )}
    </>
  )
}
