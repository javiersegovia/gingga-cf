import { useState } from 'react'
import { useParams } from '@remix-run/react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { ProjectUpdateSchema } from '@/schemas/project-schema'
import {
  useProjectQuery,
  useProjectMutation,
} from '@/queries/use-project-query'
import type { GetProjectResponse } from '@/queries/use-project-query'
import { Button } from '@/components/ui/button'
import { StatusButton } from '@/components/ui/status-button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  FormControl,
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
  CloudUploadIcon,
  LightbulbIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react'
import type { Projects } from '@/db/schema'
import { Separator } from '@/components/ui/separator'
import { ProjectOverview } from './project-overview'
import { useToast } from '@/hooks/use-toast'
import { H4 } from '@/components/ui/typography'

const Schema = ProjectUpdateSchema.pick({
  name: true,
  mainObjective: true,
  metadata: true,
})

type GeneralInformationBlockProps = {
  project: Pick<
    typeof Projects.$inferSelect,
    'id' | 'name' | 'mainObjective' | 'metadata'
  >
  projectStats: GetProjectResponse['projectStats']
}

const formId = 'general-information'

export const GeneralInformationBlockWithQuery = () => {
  const params = useParams()
  if (!params.projectId) return null

  const { data } = useProjectQuery(params.projectId)
  if (!data?.project) return null

  return (
    <GeneralInformationBlock
      project={data.project}
      projectStats={data.projectStats}
    />
  )
}

export const GeneralInformationBlock = ({
  project,
  projectStats,
}: GeneralInformationBlockProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { mutate, isPending } = useProjectMutation(project.id)
  const { toast } = useToast()
  const form = useForm({
    resolver: zodResolver(Schema),
    values: {
      name: project.name,
      mainObjective: project.mainObjective,
      metadata: JSON.stringify(project.metadata, null, 2),
    },
    defaultValues: {
      name: project.name,
      mainObjective: project.mainObjective,
      metadata: JSON.stringify(project.metadata, null, 2),
    },
  })

  const onSubmit = form.handleSubmit((data: z.infer<typeof Schema>) => {
    mutate(data, {
      onSuccess: () => {
        setIsEditing(false)
        form.reset()
        toast({
          title: 'Project updated successfully',
          description: 'Your project has been updated successfully.',
          toastType: 'success',
        })
      },
      onError: () => {
        toast({
          title: 'Failed to update project',
          description: 'Please try again.',
          toastType: 'error',
        })
      },
    })
  })

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 border border-gray-700 rounded-xl">
            <LightbulbIcon className="text-cyan-400 w-5 h-5" />
          </div>

          <H4 className="text-white">
            {isEditing ? 'Edit Project' : 'Overview'}
          </H4>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <StatusButton
              variant="save"
              size="default"
              type="submit"
              aria-label="Save changes"
              form={formId}
              status={isPending ? 'pending' : 'idle'}
              disabled={isPending}
            >
              <div className="flex items-center">
                <CloudUploadIcon className="h-4 w-4 mr-2" />
                <p>Save</p>
              </div>
            </StatusButton>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              form.reset()
              setIsEditing(!isEditing)
            }}
            aria-label={isEditing ? 'Cancel editing' : 'Edit information'}
            type="button"
          >
            {isEditing ? (
              <XIcon className="h-4 w-4" />
            ) : (
              <SlidersHorizontalIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <>
          <FormProvider {...form}>
            <form
              id={formId}
              method="PUT"
              action={`/api/projects/${project.id}`}
              onSubmit={onSubmit}
              className="flex-1 flex flex-col"
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter project name"
                          className="bg-black/30 text-gray-300 border-gray-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mainObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Objective</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="What is your purpose? What do you want to accomplish?"
                          className="bg-black/30 text-gray-300 border-gray-800 min-h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metadata"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metadata</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter metadata as JSON"
                          className="bg-black/30 text-gray-300 border-gray-800 min-h-[200px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </FormProvider>
        </>
      ) : (
        <>
          <div className="w-full pb-4">
            <ProjectOverview projectStats={projectStats} />
          </div>

          <Accordion
            type="single"
            collapsible
            defaultValue="main-objective"
            className="w-full bg-gray-800 rounded-xl"
          >
            <AccordionItem value="main-objective" className="px-4 border-none">
              <AccordionTrigger className="py-3 text-gray-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Main objective</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-400 text-sm rounded-xl">
                  {project.mainObjective}
                </p>
              </AccordionContent>
            </AccordionItem>
            <Separator className="bg-gray-700" />
            <AccordionItem value="metadata" className="px-4 border-none">
              <AccordionTrigger className="py-3 text-gray-200 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Metadata</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <pre className="text-gray-300 text-sm border border-gray-700 whitespace-pre-wrap p-4 rounded-xl overflow-auto">
                  {JSON.stringify(project.metadata, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  )
}
