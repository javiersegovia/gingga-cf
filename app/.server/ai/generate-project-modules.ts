import type { GeneralModules } from '@/db/schema'
import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { ProjectModuleSchema } from '@/schemas/project-schema'
import { AppLoadContext } from '@remix-run/cloudflare'

export const systemPrompt = `You are a senior software developer and technical architect with extensive expertise in building websites and web applications, including SaaS platforms, e-commerce sites, and AI-powered products. Your primary technology stack includes TypeScript, React, TailwindCSS, ShadcnUI, Remix.js, Supabase, and Drizzle. Do not mention any of these technologies in your responses, just use generic terms like "the web stack" or "web technologies". 

Your role is to assist users in thoroughly defining and articulating the development objectives of their new technology projects. Focus on extracting comprehensive and detailed information related to software development aspects to facilitate effective roadmap planning and timeline creation based on the user's custom requirements.

When interacting with the user, you should:

- **Understand and Clarify**:
  - Delve deep into the user's project description to understand their vision and goals.
  - Clarify any ambiguities or incomplete information by asking targeted questions.

- **Extract Detailed Information**:
  - Identify the main and specific objectives of the project, emphasizing software functionalities and technical requirements.
  - Gather information on target users, technology preferences, constraints, and any reference projects or competitors.

- **Provide Expertise and Guidance**:
  - Leverage your knowledge of the specified technology stack to suggest suitable features, technologies, and best practices.
  - Highlight considerations for scalability, security, performance, and user experience.
  - Organize the extracted information in a clear, structured format.
  - Ensure all relevant details are captured to aid in creating a comprehensive development timeline and resource allocation plan.

Take into consideration the specific prompts provided in each step of the process to generate precise, actionable, and context-rich outputs. Your goal is to ensure that all aspects pertinent to the software development lifecycle are thoroughly considered and documented, providing the best possible foundation for successful project planning and execution.

Your responses should be professional, detailed, and tailored to the user's needs, reflecting your expertise in software development and project planning.
`

interface ProjectModulesGenerationPromptProps {
  mainObjective: string
  metadata?: string | null
  generalModules: Pick<
    typeof GeneralModules.$inferSelect,
    'id' | 'name' | 'description'
  >[]
}

export const projectModulesGenerationPrompt = ({
  mainObjective,
  metadata,
  generalModules,
}: ProjectModulesGenerationPromptProps) => `Based on the project's main objective and specific objectives:

<main_objective>
${mainObjective}
</main_objective>

<metadata>
${metadata}
</metadata>

The existing general modules are pre-defined options, and can be used as a reference. The newly created ProjectModule can be related to an existing one, but it can also be completely new.
If it is related to an existing module, please use the existing module's id.

<existing_general_modules>
${generalModules
  .map(({ id, name, description }, index) => {
    return `${index + 1}. ID: ${id}\nName: ${name}\nDescription: ${description}`
  })
  .join('\n')}
</existing_general_modules>

<instructions>
Generate a list of suggested project modules (ProjectModule) that align with these objectives. For each module, provide:

<project_module_required_data>
- **Name**: A concise title. Take into account the existing modules when naming, but generate a custom name that is not too generic, and takes into account the project's objectives.
- **Description**: A brief explanation of what the module entails and how it supports the objectives.
- **GeneralModuleId**: An id that map to a general module. Only add this field if you are really confident about the relationship between the new module and the existing ones. If the new created module is not related to any existing general module, leave this field empty.
</project_module_required_data>

Ensure that the modules are actionable and relevant to achieving the project's goals.

Your goal is to ensure that all aspects pertinent to the software development lifecycle are thoroughly considered and documented, providing the best possible foundation for successful project planning and execution. Be detailed and specific in your responses. Prioritize generating the minimum quantity of ProjectModules that are REQUIRED to build the main functionalities of the product (MVP).
</instructions>`

export async function generateProjectModules(
  context: AppLoadContext,
  data: {
    mainObjective: string
    metadata?: string | null
  },
) {
  const { mainObjective, metadata } = data

  const generalModules = await context.db.query.GeneralModules.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
    },
  })

  const userPrompt = projectModulesGenerationPrompt({
    mainObjective,
    metadata,
    generalModules,
  })

  const aiClient = createOpenAI({
    apiKey: context.cloudflare.env.OPENAI_API_KEY,
  })

  const { object: projectModules } = await generateObject({
    model: aiClient('gpt-3.5-turbo'),
    prompt: userPrompt,
    system: systemPrompt,
    output: 'array',
    schema: ProjectModuleSchema,
  })

  return projectModules
}
