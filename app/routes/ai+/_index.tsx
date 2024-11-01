import { ProjectService } from '@/.server/services/project-service'
import { TextareaField } from '@/components/ui/forms'
import { FormStatusButton } from '@/components/ui/status-button'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs, json, redirect } from '@remix-run/cloudflare'
import { Form, useActionData } from '@remix-run/react'
import { FormProvider, useForm } from '@conform-to/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { Spacer } from '@/components/ui/spacer'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import { z } from 'zod'
import { H1 } from '@/components/ui/typography'

export const ProjectIdeaSchema = z.object({
  projectIdea: z
    .string()
    .min(10, 'Product description must be at least 10 characters long'),
})

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request, context)
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: ProjectIdeaSchema,
  })

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { createProject } = new ProjectService(context.db)
  const project = await createProject(userId, submission.value.projectIdea)

  return redirect(`/ai/${project.id}/chat`)
}

function Hero() {
  return (
    <div className="text-center space-y-4">
      <H1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
        Turn your idea into
        <br />a <span className="text-yellow-400">development plan</span>
      </H1>
      <p className="text-white max-w-xl mx-auto">
        Analyze the complexity of your project and generate an estimation of
        requirements, time and cost.
      </p>
    </div>
  )
}

export default function GinggaLandingPage() {
  const actionData = useActionData<typeof action>()

  const [form] = useForm({
    constraint: getZodConstraint(ProjectIdeaSchema),
    lastResult: actionData?.result,
    defaultValue: {
      projectIdea: '',
    },
    shouldRevalidate: 'onSubmit',
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: ProjectIdeaSchema }),
  })

  return (
    <div className="flex items-stretch w-full bg-gray-950 min-h-screen">
      <FlickeringGrid />

      <div className="w-full flex flex-col justify-center items-center relative">
        <Hero />

        <Spacer size="2xs" />

        <FormProvider context={form.context}>
          <Form
            id={form.id}
            method="post"
            className="flex flex-col w-full max-w-2xl z-10"
          >
            <HoneypotInputs />

            <TextareaField
              name="projectIdea"
              className="w-full"
              textareaProps={{
                placeholder: 'Describe your project idea...',
                rows: 5,
                className:
                  'placeholder:text-gray-400 border-gray-700 bg-gray-950',
              }}
            />

            <FormStatusButton
              type="submit"
              variant="secondary"
              className="w-auto mx-auto"
              size="xl"
            >
              Start generation
            </FormStatusButton>
          </Form>
        </FormProvider>
      </div>
    </div>
  )
}
