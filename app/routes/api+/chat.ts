import { requireUserId } from '@/core/auth/auth-utils.server'
import { json } from '@remix-run/cloudflare'
import type { ActionFunctionArgs } from '@remix-run/cloudflare'
import { convertToCoreMessages, streamText, tool } from 'ai'
import { z } from 'zod'
import { createOpenAI } from '@ai-sdk/openai'

const systemPrompt = `
You are an AI assistant specialized in software development and project management.
You have access to tools that allow you to read and modify project data.
Your capabilities include:
- Retrieving information about projects, modules, tasks, and other entities.
- Updating existing project details and metadata.
- Confirming critical actions before proceeding.

Guidelines:
- Use the appropriate tool when the user requests an operation.
- Ensure all required parameters are provided; ask the user for missing information.
- Confirm critical actions (like updates) with the user before proceeding.
- Provide clear and concise responses to the user, summarizing the actions taken.
- Always ensure data integrity and respect user permissions.

Available Tools:
1. getProjectInfo: Retrieve information about the current project.

2. getModules: Get a list of all modules in the platform.

3. getFunctionalitiesByModuleId: Get a list of all functionalities in a module.

4. updateProject: Update the project (name, description, main objective, or slug).
   Requires confirmation

5. updateProjectMetadata: Update the project metadata (target audience, technology preference, references, constraints, requirements, or additional notes).
   Requires confirmation

6. requestConfirmation: Request user confirmation for certain actions.

7. formatResponse: Format the response to be sent to the user.

Important Notes:
- For tools that require confirmation (updateProject and updateProjectMetadata), you must use the requestConfirmation tool first and wait for user confirmation before proceeding. Do not call the update tool before confirmation.
- Always use the formatResponse tool to structure your final response to the user.
`

const ChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'tool']),
      content: z.string(),
      data: z.any().optional(),
    }),
  ),
  projectId: z.string(),
})

export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request, context)

  const response = await request.json()

  const parsedResponse = ChatSchema.safeParse(response)

  if (!parsedResponse.success) {
    return json({ result: parsedResponse.error.message }, { status: 400 })
  }

  const { messages, projectId } = parsedResponse.data

  const project = await context.db.query.Projects.findFirst({
    where: (projects, { eq }) => eq(projects.id, projectId),
    columns: {
      id: true,
      name: true,
      description: true,
      mainObjective: true,
      specificObjectives: true,
    },
    with: {
      modules: {
        columns: {
          id: true,
          name: true,
          description: true,
        },
        with: {
          functionalities: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  if (!project) {
    return json({ error: 'Project not found' }, { status: 404 })
  }

  const aiClient = createOpenAI({
    apiKey: context.cloudflare.env.OPENAI_API_KEY,
  })

  const result = await streamText({
    model: aiClient('gpt-3.5-turbo'),
    abortSignal: request.signal,
    system: systemPrompt,
    tools: {
      getProjectInfo: tool({
        description: 'Get information about the current project',
        parameters: z.object({
          infoType: z.enum(['general', 'objectives', 'modules', 'tasks']),
        }),
        execute: async ({ infoType }) => {
          try {
            switch (infoType) {
              case 'general':
                return {
                  success: true,
                  description:
                    'General project information retrieved successfully',
                  data: {
                    name: project.name,
                    description: project.description,
                    mainObjective: project.mainObjective,
                  },
                }
              case 'objectives':
                return {
                  success: true,
                  description: 'Project objectives retrieved successfully',
                  data: {
                    mainObjective: project.mainObjective,
                    specificObjectives: project.specificObjectives,
                  },
                }
              case 'modules':
                return {
                  success: true,
                  description: 'Project modules retrieved successfully',
                  data: project.modules,
                }
              case 'tasks':
                return {
                  success: true,
                  description: 'Project tasks retrieved successfully',
                  data: project.modules.flatMap(
                    (module) => module.functionalities,
                  ),
                }
              default:
                return {
                  success: false,
                  description: 'Invalid info type',
                  error: 'Invalid info type provided',
                }
            }
          } catch (error) {
            console.error('Error retrieving project info:', error)
            return {
              success: false,
              description: 'Failed to retrieve project information',
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          }
        },
      }),
      getModules: tool({
        description: 'Get a list of all project modules.',
        parameters: z.object({}),
        execute: async () => {
          return project.modules
        },
      }),
      getFunctionalitiesByModuleId: tool({
        description: 'Get a list of all functionalities in a project module.',
        parameters: z.object({
          moduleId: z.string(),
        }),
        execute: async ({ moduleId }) => {
          return project.modules.find((module) => module.id === moduleId)
            ?.functionalities
        },
      }),

      formatResponse: tool({
        description:
          'Format the response to be sent to the user. This is always the last tool called in the conversation. In this response, you should summarize all the "tools" you used.',
        parameters: z.object({ message: z.string() }),
      }),
    },
    messages: [
      {
        role: 'system',
        content:
          'You are an AI assistant helping with software development questions. ' +
          'You have access to information about the current project. ' +
          'Use the getProjectInfo tool to fetch relevant information when needed. ' +
          'For certain actions, use the requestConfirmation tool to ask for user confirmation before proceeding.',
      },
      ...convertToCoreMessages(messages),
    ],
    maxSteps: 5, // Allow up to 5 steps for tool calls
    experimental_toolCallStreaming: true,
    onFinish(event) {
      console.log(event.usage)
      const totalTokens = event.usage?.totalTokens || 0

      console.log(`Total Tokens Used: ${totalTokens}`)

      // GPT-3.5 Turbo: $0.002 per 1K tokens
      const gpt35Cost = (totalTokens / 1000) * 0.002
      console.log(`GPT-3.5 Turbo: $${gpt35Cost.toFixed(4)} USD`)

      // Claude 3 Sonnet: $0.003 per 1K tokens (estimated)
      const claudeCost = (totalTokens / 1000) * 0.003
      console.log(`Claude 3 Sonnet: $${claudeCost.toFixed(4)} USD`)

      // GPT-4: $0.03 per 1K tokens
      const gpt4Cost = (totalTokens / 1000) * 0.03
      console.log(`GPT-4: $${gpt4Cost.toFixed(4)} USD`)

      // Anthropic's Claude 2: $0.01102 per 1K tokens
      const claude2Cost = (totalTokens / 1000) * 0.01102
      console.log(`Claude 2: $${claude2Cost.toFixed(4)} USD`)

      // OpenAI's GPT-4 Turbo: $0.01 per 1K tokens
      const gpt4TurboCost = (totalTokens / 1000) * 0.01
      console.log(`GPT-4 Turbo: $${gpt4TurboCost.toFixed(4)} USD`)
    },
    onStepFinish(event) {
      console.log('onStepFinish')
      console.log(event)
    },
  })

  const controller = new AbortController()
  request.signal.addEventListener('abort', () => {
    controller.abort()
  })

  return result.toDataStreamResponse()
}
