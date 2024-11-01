import {
  useDeleteProjectModuleMutation,
  useGenerateComplexityMetricsMutation,
  useGenerateFunctionalitiesMutation,
  useProjectModuleQuery,
  useProjectQuery,
  useUpdateProjectModuleMutation,
} from '@/queries/use-project-query'
import type {
  GetProjectModuleResponse,
  GetProjectResponse,
} from '@/queries/use-project-query'
import { useParams } from '@remix-run/react'
import { Button } from '@/components/ui/button'
import {
  HardDrive,
  Brain,
  Clock,
  BrainIcon,
  XIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  CloudUploadIcon,
  ClockIcon,
  PackageIcon,
  InfoIcon,
  // Plus,
  // PlusIcon,
  // RotateCwIcon,
} from 'lucide-react'
import { cn } from '@/core/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useSelectedFunctionality } from '@/stores/functionalities-store'
import { StatusButton } from '@/components/ui/status-button'
import { useState } from 'react'
import { Spacer } from '@/components/ui/spacer'
import { DirectionAwareTabs } from '@/components/ui/direction-aware-tabs'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UpdateProjectModuleSchema } from '@/schemas/project-schema'
import type { UpdateProjectModule } from '@/schemas/project-schema'
import { Separator } from '@/components/ui/separator'
import { ProjectModuleSkeleton } from '@/components/projects/project-module-skeleton'
import { H4 } from '@/components/ui/typography'

export function ModulesBlockWithQuery() {
  const params = useParams()

  if (!params.projectId) return null
  const { data } = useProjectQuery(params.projectId)

  if (!data?.project) return null
  const { project } = data

  return <ModulesBlock key={project.id} project={project} />
}

type ModulesBlockProps = {
  project: GetProjectResponse['project']
}

type ModuleItem = {
  id: string
  isDraft?: boolean
}

function ModulesBlock({ project }: ModulesBlockProps) {
  const initialModuleItems = project.modules.map((module) => ({
    id: module.id,
  }))
  const [moduleItems, setModuleItems] =
    useState<ModuleItem[]>(initialModuleItems)

  // const handleAddModule = () => {
  //   setModuleItems((prev) => [...prev, { id: Date.now().toString(), isDraft: true }])
  // }

  // const handleResetModules = () => {
  //   setModuleItems(initialModuleItems)
  // }

  const handleDeleteModule = (id: string) => {
    setModuleItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex items-center mr-auto gap-2">
          <div className="p-2 border border-gray-700 rounded-xl">
            <PackageIcon className="text-pink-500 w-5 h-5" />
          </div>

          <H4 className="text-white">Modules</H4>
        </div>

        {/* <Button
          variant="ghost"
          size="icon"
          // disabled={items?.length > 7}
          onClick={handleAddModule}
          className={cn(
            'border border-gray-800 hover:border-transparent',
            // items?.length > 7 ? 'opacity-50 cursor-not-allowed' : '',
          )}
        >
          <PlusIcon className="h-5 w-5" />
        </Button>

        <div data-tip="Reset task list">
          <Button
            variant="ghost"
            className="border border-gray-800 hover:border-transparent"
            size="icon"
            onClick={handleResetModules}
          >
            <RotateCwIcon className="h-5 w-5" />
          </Button>
        </div> */}
      </div>

      <Spacer size="4xs" />

      {moduleItems.length === 0 ? (
        <div className="text-gray-300 text-sm">
          No modules yet. Add a module to start.
        </div>
      ) : (
        <div className="space-y-4">
          {moduleItems.map((module, index) => (
            <ProjectModuleCardWithQuery
              key={module.id}
              projectId={project.id}
              moduleId={module.id}
              order={index + 1}
              isDraft={module.isDraft}
              onDelete={handleDeleteModule}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectModuleCardWithQuery({
  projectId,
  moduleId,
  order,
  isDraft = false,
  onDelete,
}: {
  projectId: string
  moduleId: string
  order: number
  onDelete: (id: string) => void
  isDraft?: boolean
}) {
  const { data: projectModule, isLoading } = useProjectModuleQuery(
    projectId,
    moduleId,
    {
      enabled: !!projectId && !!moduleId && !isDraft,
    },
  )

  if (isLoading) return <ProjectModuleSkeleton className="w-full" />

  if (isDraft) {
    return (
      <>
        CreateProjectModuleForm
        {/* <CreateProjectModuleForm
          projectId={projectId}
          module={projectModule}
          onCancel={() => {}}
          onSave={() => {}}
        /> */}
      </>
    )
  }

  if (!projectModule) return null

  return (
    <ProjectModuleCard
      projectId={projectId}
      module={projectModule}
      order={order}
      onDelete={onDelete}
    />
  )
}

type ProjectModuleProps = {
  projectId: string
  module: GetProjectModuleResponse
  order: number
  onDelete: (id: string) => void
}

function ProjectModuleCard({
  projectId,
  module,
  order,
  onDelete,
}: ProjectModuleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  return (
    <div className="bg-gray-950 rounded-2xl p-4 relative">
      {isDeleting && (
        <ProjectModuleDeleteDialog
          projectId={projectId}
          moduleId={module.id}
          onCancel={() => setIsDeleting(false)}
          onDelete={onDelete}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-white/50 font-mono text-sm">{order}</span>
          <h4 className="text-gray-200 text-lg">
            {isEditing ? 'Edit module' : module.name}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsEditing(true)
                }}
                aria-label="Edit module"
                type="button"
              >
                <SlidersHorizontalIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setIsDeleting(true)
                }}
                aria-label="Delete module"
                type="button"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </>
          )}

          {isEditing && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(false)}
              aria-label="Cancel editing"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <UpdateProjectModuleForm
          projectId={projectId}
          module={module}
          onCancel={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      ) : (
        <>
          {module.functionalities.length > 0 && (
            <>
              <Spacer size="4xs" />
              <ProjectModuleStats
                functionalitiesCount={module.functionalities.length}
                complexityMetricScore={module.moduleTime?.complexityMetricScore}
                estimatedHours={module.moduleTime?.estimatedHours}
              />
            </>
          )}

          <Spacer size="4xs" />

          <div className="text-gray-300 text-sm bg-gray-800 p-4 rounded-xl">
            <p>{module.description}</p>

            {/* {module.additionalInfo && (
              <>
                <Separator className="bg-gray-700 my-4" />

                <Accordion type="single" collapsible className="relative">
                  <AccordionItem value="additional-info" className="border-none">
                    <AccordionTrigger className="py-0 px-0 hover:no-underline">
                      <div className="flex items-center space-x-2">
                        <InfoIcon className="text-gray-400 w-5 h-5" />
                        <span className="text-gray-400">Additional details</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pt-2 pb-0 text-gray-400">
                      <p>{module.additionalInfo}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )} */}
            {/* {module.additionalInfo && (
              <div className="text-gray-300">
                <Separator className="bg-gray-700 my-4" />
                <div className="flex items-center mb-4 space-x-2">
                  <InfoIcon className="text-gray-400 w-5 h-5" />
                  <span className="">Considerations:</span>
                </div>

                <p>{module.additionalInfo}</p>
              </div>
            )} */}
          </div>

          <Spacer size="4xs" />

          <ProjectModuleAccordion
            functionalities={module.functionalities}
            moduleTime={module.moduleTime}
            projectId={projectId}
            moduleId={module.id}
            additionalInfo={module.additionalInfo}
          />
        </>
      )}
    </div>
  )
}

type ProjectModuleStatsProps = {
  functionalitiesCount: number
  complexityMetricScore?: number | null
  estimatedHours?: number | null
}

function ProjectModuleStats({
  functionalitiesCount,
  complexityMetricScore,
  estimatedHours,
}: ProjectModuleStatsProps) {
  const complexityLevel = getComplexityLevel(complexityMetricScore)

  return (
    <TooltipProvider>
      <div className="flex gap-2 justify-start">
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                functionalitiesCount > 0
                  ? 'bg-gray-800'
                  : 'bg-transparent border-gray-800 border',
              )}
            >
              <HardDrive className="text-yellow-400 w-5 h-5" />
              {functionalitiesCount > 0 && (
                <span className="text-white">{functionalitiesCount}</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="bottom">
            <p>Number of functionalities in this module.</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'rounded-xl hover:cursor-pointer px-4 py-2 flex items-center text-sm space-x-2',
                estimatedHours
                  ? 'bg-gray-800'
                  : 'bg-transparent border-gray-800 border',
              )}
            >
              <Clock className="text-emerald-400 w-5 h-5" />
              {!!estimatedHours && (
                <span className="text-gray-400">{estimatedHours}h</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-2" side="bottom">
            <p>Estimated time to implement this module.</p>
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
              <Brain className="text-blue-400 w-5 h-5" />
              {!!complexityMetricScore && (
                <span className="text-gray-400">
                  {complexityMetricScore} — {complexityLevel}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-2" side="bottom">
            <p>
              Complexity level of the module. This measures the intricacy and
              difficulty of implementation.
            </p>
            {complexityMetricScore && (
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

function ProjectModuleDeleteDialog({
  projectId,
  moduleId,
  onCancel,
  onDelete,
}: {
  projectId: string
  moduleId: string
  onCancel: () => void
  onDelete: (id: string) => void
}) {
  const deleteProjectModuleMutation = useDeleteProjectModuleMutation(projectId)

  const handleDeleteModule = () => {
    deleteProjectModuleMutation.mutate(
      { id: moduleId },
      { onSuccess: () => onDelete(moduleId) },
    )
  }

  return (
    <div className="absolute top-0 right-0 z-20 bg-gray-950/80 backdrop-blur-[2px] p-4 w-full h-full rounded-xl flex flex-col items-center justify-center">
      <p className="text-gray-300 text-lg mb-4 max-w-xs text-center">
        Are you sure you want to delete this module?
      </p>

      <div className="flex items-center gap-2">
        <StatusButton
          variant="outline"
          size="lg"
          className="border-gray-700 bg-gray-800 relative hover:bg-gray-700 hover:text-white text-gray-200"
          onClick={handleDeleteModule}
          status={deleteProjectModuleMutation.isPending ? 'pending' : 'idle'}
          disabled={deleteProjectModuleMutation.isPending}
          spinDelay={{ delay: 0 }}
        >
          <div className="flex gap-2">
            <Trash2Icon className="text-red-500 w-5 h-5" />
            Delete
          </div>
        </StatusButton>

        <Button
          variant="outline"
          size="lg"
          className="border-gray-700 relative hover:bg-gray-700 hover:text-white text-gray-200"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

type ProjectModuleAccordionProps = {
  projectId: string
  moduleId: string
  additionalInfo?: string | null
  functionalities: {
    id: string
    name: string
    functionalityTime?: {
      estimatedHours: number | null
      complexityMetricScore: number | null
    }
  }[]
  moduleTime?: {
    estimatedHours: number | null
    complexityMetricScore: number | null
  }
}

function ProjectModuleAccordion({
  projectId,
  moduleId,
  functionalities,
  moduleTime,
  additionalInfo,
}: ProjectModuleAccordionProps) {
  const { setFunctionalityId, functionalityId } = useSelectedFunctionality()

  const handleSelectFunctionality = (id: string) => {
    setFunctionalityId(id === functionalityId ? null : id)
  }

  const generateFunctionalitiesMutation = useGenerateFunctionalitiesMutation(
    projectId,
    moduleId,
  )
  const generateComplexityMetricsMutation =
    useGenerateComplexityMetricsMutation(projectId, moduleId)

  return (
    <div className="relative">
      {/* {functionalities.length === 0 && (
        <div className="absolute top-0 right-0 z-10 bg-gray-800/60 backdrop-blur-[2px] p-4 w-full h-full rounded-xl flex flex-col items-center justify-center">
          <StatusButton
            variant="outline"
            size="lg"
            className="border-gray-700 bg-gray-800 relative hover:bg-gray-700 hover:text-white text-gray-200"
            onClick={() => generateFunctionalitiesMutation.mutate()}
            status={generateFunctionalitiesMutation.isPending ? 'pending' : 'idle'}
            disabled={generateFunctionalitiesMutation.isPending}
            spinDelay={{ delay: 0 }}
          >
            <div className="flex gap-2">
              <HardDrive className="text-yellow-400 w-5 h-5" />
              Generate functionalities
            </div>
          </StatusButton>
        </div>
      )} */}

      {additionalInfo && (
        <>
          {/* <Separator className="bg-gray-700 my-4" /> */}

          {/* <Accordion type="single" collapsible className="bg-gray-800 rounded-xl relative">
            <AccordionItem value="additional-info" className="border-none">
              <AccordionTrigger className="py-3 px-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <InfoIcon className="text-gray-400 w-5 h-5" />
                  <span className="text-gray-400">Additional details</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pt-2 pb-0 text-gray-400">
                <p>{additionalInfo}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion> */}

          {/* <Spacer size="4xs" /> */}
        </>
      )}

      <Accordion
        type="single"
        collapsible
        className="bg-gray-800 rounded-xl relative"
      >
        <AccordionItem value="additional-info" className="border-none">
          <AccordionTrigger className="py-3 px-4 hover:no-underline">
            <div className="flex items-center space-x-2">
              <InfoIcon className="text-gray-400 w-5 h-5" />
              <span className="text-gray-300">Additional details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2 pb-4 text-gray-400">
            <p>{additionalInfo}</p>
          </AccordionContent>
        </AccordionItem>

        {functionalities.length > 0 && (
          <>
            <Separator className="bg-gray-700" />
            <AccordionItem value="functionalities" className="border-none">
              <AccordionTrigger className="py-3 px-4 hover:no-underline">
                <div className="flex items-center space-x-2">
                  <HardDrive className="text-yellow-400 w-5 h-5" />
                  <span
                    className={cn(
                      'text-gray-300',
                      functionalities.length > 0 && 'text-gray-300',
                    )}
                  >
                    {functionalities.length > 0
                      ? 'Functionalities'
                      : 'No functionalities yet'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pt-2 pb-4 text-gray-400">
                <ul className="space-y-1">
                  {functionalities.map(({ id, name, functionalityTime }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => handleSelectFunctionality(id)}
                        className={cn(
                          'rounded-xl w-full text-left px-4 hover:bg-gray-700 py-2 grid grid-cols-[1fr_auto] items-stretch',
                          functionalityId === id && 'bg-gray-700',
                        )}
                      >
                        <span>{name}</span>
                        <div className="flex justify-end items-center gap-4 min-w-24">
                          {functionalityTime?.estimatedHours && (
                            <div className="flex items-center min-w-12 gap-1">
                              <ClockIcon className="text-gray-400 w-4 h-4" />
                              <span className="text-gray-400 text-xs">
                                {functionalityTime?.estimatedHours}h
                              </span>
                            </div>
                          )}
                          {functionalityTime?.complexityMetricScore && (
                            <div className="flex items-center min-w-12 gap-1">
                              <BrainIcon className="text-gray-400 w-4 h-4" />
                              <span className="text-gray-400 text-xs">
                                {functionalityTime?.complexityMetricScore}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </>
        )}

        {/* <Separator className="bg-gray-700" /> */}

        {/* <AccordionItem value="complexity" className="border-none">
          <AccordionTrigger className="py-3 px-4 hover:no-underline">
            <div className="flex items-center space-x-2">
              <Brain className={cn('text-sky-400 w-5 h-5', !moduleTime?.complexityMetricScore && 'opacity-40')} />
              <span className={cn('text-gray-400/70', moduleTime?.complexityMetricScore && 'text-gray-300')}>
                {moduleTime?.complexityMetricScore ? 'Complexity' : 'Complexity unknown'}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 text-gray-400">
            {moduleTime?.complexityMetricScore ? (
              <>
                <p className="text-sm">
                  <span className="font-medium">Score:</span>
                  <span className="ml-1 text-sm">
                    {moduleTime?.complexityMetricScore} out of 10 (
                    {getComplexityLevel(moduleTime?.complexityMetricScore)})
                  </span>
                </p>

                <p className="text-sm mt-4">
                  This is the average complexity score of all functionalities inside the module.
                </p>
              </>
            ) : (
              <StatusButton
                variant="outline"
                size="lg"
                className="border-gray-700 bg-gray-800 mx-auto my-4 relative hover:bg-gray-700 hover:text-white text-gray-200"
                onClick={() => generateComplexityMetricsMutation.mutate()}
                status={generateComplexityMetricsMutation.isPending ? 'pending' : 'idle'}
                spinDelay={{ delay: 0 }}
                disabled={generateComplexityMetricsMutation.isPending}
              >
                <div className="flex gap-2">
                  <BrainIcon className="text-sky-400 w-5 h-5" />
                  {generateComplexityMetricsMutation.isPending ? <>Calculating...</> : <>Calculate complexity</>}
                </div>
              </StatusButton>
            )}
          </AccordionContent>
        </AccordionItem> */}

        {/* <AccordionItem value="estimated-time" className="border-none">
          <AccordionTrigger className="py-3 px-4 hover:no-underline">
            <div className="flex items-center space-x-2">
              <ClockIcon className={cn('text-emerald-400 w-5 h-5', !moduleTime?.estimatedHours && 'opacity-40')} />
              <span className={cn('text-gray-400/70', moduleTime?.estimatedHours && 'text-gray-300')}>
                {moduleTime?.estimatedHours ? `${moduleTime?.estimatedHours}h` : 'Estimated time unknown '}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-11 pr-9 pt-2 pb-4 text-gray-400">
            <StatusButton
              variant="outline"
              size="lg"
              className="border-gray-700 bg-gray-800 mx-auto my-4 relative hover:bg-gray-700 hover:text-white text-gray-200"
              // onClick={handleGenerateFunctionalities} // todo
              status="idle" // todo
              spinDelay={{ delay: 0 }}
              disabled={true}
            >
              <div className="flex gap-2">
                <ClockIcon className="text-emerald-400 w-5 h-5" />
                {!moduleTime?.estimatedHours ? <span>Complexity required</span> : <span>Unavailable right now</span>}
              </div>
            </StatusButton>
          </AccordionContent>
        </AccordionItem> */}
      </Accordion>

      {functionalities.length === 0 && (
        <>
          <Spacer size="4xs" />
          <StatusButton
            variant="outline"
            size="lg"
            className="border-gray-700 mx-auto my-4 relative hover:text-white text-gray-200"
            onClick={() => generateFunctionalitiesMutation.mutate()}
            status={
              generateFunctionalitiesMutation.isPending ? 'pending' : 'idle'
            }
            disabled={generateFunctionalitiesMutation.isPending}
            spinDelay={{ delay: 0 }}
          >
            <div className="flex gap-2">
              <HardDrive className="text-yellow-400 w-5 h-5" />
              {generateFunctionalitiesMutation.isPending ? (
                <>Generating...</>
              ) : (
                <>Generate functionalities</>
              )}
            </div>
          </StatusButton>
        </>
      )}

      {functionalities.length > 0 && !moduleTime?.complexityMetricScore && (
        <>
          <Spacer size="4xs" />
          <StatusButton
            variant="outline"
            size="lg"
            className="border-gray-700 bg-transparent mx-auto my-4 relative hover:bg-gray-700 hover:text-white text-gray-200"
            onClick={() => generateComplexityMetricsMutation.mutate()}
            status={
              generateComplexityMetricsMutation.isPending ? 'pending' : 'idle'
            }
            spinDelay={{ delay: 0 }}
            disabled={generateComplexityMetricsMutation.isPending}
          >
            <div className="flex gap-2">
              <ClockIcon className="text-emerald-400 w-5 h-5" />
              <BrainIcon className="text-sky-400 w-5 h-5" />
              {generateComplexityMetricsMutation.isPending ? (
                <>Generating...</>
              ) : (
                <>Generate metrics</>
              )}
            </div>
          </StatusButton>
        </>
      )}
    </div>
  )
}

// Add this helper function at the end of the file
function getComplexityLevel(
  complexityMetricScore: number | null | undefined,
): string {
  if (complexityMetricScore === null || complexityMetricScore === undefined)
    return 'Unknown'
  if (complexityMetricScore >= 1 && complexityMetricScore < 4) return 'Low'
  if (complexityMetricScore >= 4 && complexityMetricScore < 7) return 'Moderate'
  if (complexityMetricScore >= 7) return 'High'
  return 'Invalid'
}

function UpdateProjectModuleForm({
  projectId,
  module,
  onCancel,
  onSave,
}: {
  projectId: string
  module: GetProjectModuleResponse
  onCancel: () => void
  onSave: () => void
}) {
  const updateProjectModule = useUpdateProjectModuleMutation(
    projectId,
    module.id,
  )

  const form = useForm<UpdateProjectModule>({
    resolver: zodResolver(UpdateProjectModuleSchema),
    values: {
      name: module.name,
      description: module.description,
      additionalInfo: module.additionalInfo || '',
      moduleTime: module.moduleTime,
    },
    defaultValues: {
      name: module.name,
      description: module.description,
      additionalInfo: module.additionalInfo || '',
      moduleTime: module.moduleTime,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await updateProjectModule.mutateAsync(data)
      onSave()
    } catch (error) {
      console.error('Failed to update module:', error)
    }
  })

  const tabs = [
    {
      id: 0,
      label: 'Main Information',
      content: (
        <div className="space-y-4 text-gray-300">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter module name" />
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
                  <Textarea {...field} placeholder="Enter module description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter any additional information"
                  />
                </FormControl>
                <FormMessage />
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
            name="moduleTime.estimatedHours"
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
            name="moduleTime.actualHours"
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
            name="moduleTime.complexityMetricScore"
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
            name="moduleTime.fpaEstimate"
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
            name="moduleTime.finalEstimate"
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
            disabled={updateProjectModule.isPending}
          >
            <CloudUploadIcon className="h-4 w-4 mr-2" />
            {updateProjectModule.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
