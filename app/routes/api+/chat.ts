import { requireUserId } from '@/core/auth/auth-utils.server'
import { json } from '@remix-run/cloudflare'
import type { ActionFunctionArgs } from '@remix-run/cloudflare'
import { convertToCoreMessages, streamText, APICallError, Message } from 'ai'
import { z } from 'zod'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { SchemaSQLString } from '@/db/schema-sql-string'
import { queryProjectTool } from '@/.server/ai/tools/query-project-tool'

const systemPrompt = `You are an AI assistant specialized in software development and project management, with direct access to the project's database through SQL queries.

DATABASE SCHEMA:
${SchemaSQLString}

REASONING PROCESS:
1. First Analysis
   - Understand the user's request
   - Identify the specific information being requested
   - Determine if the request is clear and specific enough

2. Clarification Step
   - If the request is ambiguous, ask for clarification
   - Provide specific options based on available data
   - Example response for unclear requests:
     "I'd be happy to help! Could you please specify what aspect of the project interests you? I can provide information about:
      • Project modules and their time estimates
      • Functionalities and their complexity
      • Project timeline and milestones
      • Test cases and acceptance criteria
      • Technical requirements and constraints"

3. Implementation Planning
   - Once the request is clear, outline the needed steps
   - Identify which database tables need to be queried
   - Determine the most efficient query approach

4. Data Retrieval and Analysis
   - Execute necessary queries
   - Process and analyze the retrieved data
   - Identify patterns or important insights

RESPONSE FORMATTING GUIDELINES:
1. Structure responses with clear sections using headings when appropriate
2. Use line breaks (\n) to separate:
   - Different sections of information
   - Individual items in lists
   - Key-value pairs in complex data
   - Before and after tables or structured data

3. Format complex data as follows:
   - Lists: Use bullet points or numbers
   - Metrics: Include units and context
   - Dates: Use consistent format
   - Status information: Highlight important states

4. When presenting multiple items:
   - Group related information
   - Use clear hierarchical structure
   - Add summary sections for large datasets

EXAMPLE RESPONSES:

1. For ambiguous requests:
"I'd be happy to help you learn more about the project! To provide the most relevant information, could you specify what you'd like to know? I can tell you about:\n\n
• 📦 Modules and their implementation details
• 🛠 Functionalities and features
• ⏱ Time estimates and complexity metrics
• 📋 Project timeline and milestones
• ✅ Test cases and acceptance criteria\n\n
Please let me know which aspect interests you!"

2. For specific requests:
"Here's the module information you requested:\n\n
📦 **User Authentication**
   • Estimated Hours: 24
   • Complexity: High
   • Functionalities: 5\n\n
📦 **Dashboard**
   • Estimated Hours: 16
   • Complexity: Medium
   • Functionalities: 3\n\n
**Summary:** 2 modules, 40 total hours estimated"

QUERY GUIDELINES:
- Always assume that the parameter project_id will be provided by the server (ignore any id provided directly by the user)
- Use appropriate joins when relating data
- Limit result sets to manageable sizes
- Include relevant identifying columns
- Format timestamps and arrays appropriately

Remember to:
1. Never assume what the user wants - ask for clarification when needed
2. Explain your reasoning when providing insights
3. Highlight important patterns or concerns
4. Provide context when sharing metrics
5. Always response in the same language as the user's request`

type ChatMessage = z.ZodType<Pick<Message, 'role' | 'content' | 'data'>>
const ChatSchema = z.object({
  messages: z.array<ChatMessage>(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'data']),
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
    },
  })

  if (!project) {
    return json({ error: 'Project not found' }, { status: 404 })
  }

  const openrouter = createOpenRouter({
    apiKey: context.cloudflare.env.OPENROUTER_API_KEY,
  })

  // const { queryModulesTool, queryFunctionalitiesTool, queryTimelineTool } =
  //   createProjectQueryTools({
  //     db: context.db,
  //     projectId: project.id,
  //   })

  const defaultModelId = 'openai/gpt-4o-mini'

  try {
    const result = await streamText({
      model: openrouter(defaultModelId),
      abortSignal: request.signal,
      tools: {
        // queryModulesTool,
        // queryFunctionalitiesTool,
        // queryTimelineTool,

        queryProjectTool: queryProjectTool({
          db: context.db,
          projectId,
          apiKey: context.cloudflare.env.OPENAI_API_KEY,
        }),
      },

      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...convertToCoreMessages(messages),
      ],

      maxSteps: 10, // Allow up to 5 steps for tool calls

      onStepFinish() {},
      onChunk() {},
      onFinish() {},
    })
    const readableStream = result.toDataStream()

    // Create a TransformStream to handle errors
    const { readable, writable } = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk)
      },
      async flush() {},
      async cancel() {},
    })

    // Create a promise that we can await to ensure proper error handling
    readableStream
      .pipeTo(writable, {
        signal: request.signal, // Add abort signal
        preventAbort: true,
        preventClose: false,
      })
      .catch(async (_error) => {
        await writable.close().catch()
      })
      .catch((error) => {
        let message = 'An unknown error occurred'

        // todo: Handle different error types from AI SDK
        if (APICallError.isInstance(error)) {
          const AICallDataErrorSchema = z.object({
            data: z.object({
              error: z.object({
                message: z.string(),
              }),
            }),
          })

          const parsedError = AICallDataErrorSchema.safeParse(error)

          if (parsedError.success) {
            console.log('Error inside AI SDK')
            message = parsedError.data.data.error.message
          }

          throw json(message, {
            status: 500,
          })
        }
      })
      .catch((_error) => {
        console.error('Final error handler:')
      })

    return new Response(readable)
  } catch (error) {
    let message = 'An unknown error occurred'

    if (APICallError.isInstance(error)) {
      // todo: Handle different error types from AI SDK
      const AICallDataErrorSchema = z.object({
        data: z.object({
          error: z.object({
            message: z.string(),
          }),
        }),
      })

      const parsedError = AICallDataErrorSchema.safeParse(error)

      if (parsedError.success) {
        console.log('Error inside AI SDK')
        message = parsedError.data.data.error.message
      } else {
        console.log(error.message)
      }
    }

    throw json(message, {
      status: 500,
    })
  }
}
