import { ProjectFunctionalities, projectFunctionalityType } from '@/db/schema'
import type { ProjectModules } from '@/db/schema'
import type { ProjectWithModules } from '@/.server/services/project-service'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { AppLoadContext } from '@remix-run/cloudflare'

// Updated system prompt to focus on a single module
const systemPrompt = `You are a senior software developer and technical architect with extensive expertise in building websites and web applications, including SaaS platforms, e-commerce sites, and AI-powered products. You excel at breaking down project modules into detailed functionalities, leveraging all available data to create precise and actionable implementation plans.

Your role is to analyze the provided project and module details, along with any metadata and additional information, to generate a comprehensive list of development tasks required to build this specific project module.

When generating the functionalities, you should:

- **Utilize All Available Data**:
  - Carefully review the project description, main objective, metadata, and any additional information provided for the module.
  - Ensure that every functionality is informed by this data to enhance accuracy and relevance.

- **Engage in Thoughtful Reasoning**:
  - Reason about the best functionalities to include, focusing on what is essential for achieving the module's purpose within the overall project.
  - Consider dependencies between functionalities and the logical sequence of implementation.

- **Provide Detailed Output**:
  - For each functionality, include a name, detailed description, type, and acceptance criteria.
  - The acceptance criteria should be clear conditions that must be met for the functionality to be considered complete.

Your responses should be professional, detailed, and structured to facilitate effective project planning and execution.`

// Updated the prompt to focus on a single module
type ProjectFunctionalitiesPromptProps = {
  description: string
  mainObjective: string
  metadata?: string
  projectModule: Pick<
    typeof ProjectModules.$inferSelect,
    'name' | 'description' | 'additionalInfo'
  >
}

export const projectFunctionalitiesPrompt = ({
  description,
  mainObjective,
  metadata,
  projectModule,
}: ProjectFunctionalitiesPromptProps) => {
  return `Based on the following project and module details, generate a comprehensive list of functionalities required to build this specific module. Use all available data, including metadata and additional information, to ensure accuracy and relevance.

**Project Description**:
${description}

**Project Main Objective**:
${mainObjective}

**Metadata**:
${metadata}

**Project Module Details**:
- **Name**: ${projectModule.name}
- **Description**: ${projectModule.description}
- **Additional Info**: ${projectModule.additionalInfo || 'None'}

**Instructions**:

1. **Functionality Generation**:
   - Carefully analyze the provided information to identify all necessary functionalities for this module.
   - For each functionality, provide the following details:
     - **Name**: A concise title of the functionality. Should be a short sentence, explaining the main purpose of the functionality.
     - **Description**: A detailed explanation of what the functionality entails and how it contributes to the module and overall project.
     - **Type**: An enum. Only choose one of the following types: ${projectFunctionalityType
       .map((type) => `"${type}"`)
       .join(', ')}.
     - **Acceptance Criteria**: Define clear conditions that must be met for the functionality to be considered complete. This will be an array of strings. The acceptance criteria are crucial, as they will be used to test the functionality.

2. **Reasoning**:
   - Explain your reasoning for including each functionality, referencing specific parts of the project description, main objective, metadata, or additional info that support its inclusion.
   - Ensure that the functionalities collectively cover all aspects necessary for the module to fulfill its role in the MVP.

3. **Output Format**:
   - Present the functionalities as an array in JSON format.
   - Each functionality should include the fields: name, description, type, and acceptanceCriteria.

**Example**:
"""
[
  {
    "name": "User login with credentials and magic link",
    "description": "Allow users to log into the application using their email and password. The functionality should also support logging in with a magic link.",
    "type": "SECURITY",
    "acceptanceCriteria": [
      "Users can log in with valid credentials and are redirected to the dashboard.",
      "Users can log out from the application.",
      "Users can log in with a magic link.",
      "Display an error message when users attempt to log in with invalid credentials.",
      "Display a success message when users log in with a magic link.",
      "Display an error message when users attempt to log in with a magic link and the email is invalid.",
    ]
  }
]
"""

Generate the list of functionalities for this specific module now.`
}

const ProjectFunctionalitySchema = z.object({
  name: z.string().describe('A short title.'),
  description: z
    .string()
    .describe('A detailed description of the functionality.'),
  type: z.enum(projectFunctionalityType),
  acceptanceCriteria: z.array(
    z
      .string()
      .describe(
        'The acceptance criteria for the functionality to be completely functional.',
      ),
  ),
})

export async function generateFunctionalitiesByProjectModuleId(
  context: AppLoadContext,
  project: Pick<
    ProjectWithModules,
    'id' | 'description' | 'mainObjective' | 'metadata'
  >,
  projectModule: Pick<
    typeof ProjectModules.$inferSelect,
    'id' | 'name' | 'description' | 'additionalInfo'
  >,
) {
  const userPrompt = projectFunctionalitiesPrompt({
    description: project.description,
    mainObjective: project.mainObjective,
    metadata: JSON.stringify(project.metadata, null, 2),
    projectModule: {
      name: projectModule.name,
      description: projectModule.description,
      additionalInfo: projectModule.additionalInfo,
    },
  })

  const { db, cloudflare } = context

  const openai = createOpenAI({
    apiKey: cloudflare.env.OPENAI_API_KEY,
  })

  const { object: projectFunctionalities } = await generateObject({
    model: openai('gpt-4o-mini'),
    prompt: userPrompt,
    system: systemPrompt,
    output: 'array',
    schema: ProjectFunctionalitySchema,
  })

  console.info(
    '~~~~~~~~~~~~~~~AI generated project functionalities~~~~~~~~~~~~~~~',
  )
  console.log(JSON.stringify(projectFunctionalities, null, 2))
  console.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

  return db.transaction(async (tx) => {
    const insertedFunctionalities = await Promise.all(
      projectFunctionalities.map(async (functionality) => {
        const [insertedFunctionality] = await tx
          .insert(ProjectFunctionalities)
          .values({
            projectId: project.id,
            projectModuleId: projectModule.id,
            name: functionality.name,
            description: functionality.description,
            type: functionality.type,
            acceptanceCriteria: functionality.acceptanceCriteria,
          })
          .returning()

        if (!insertedFunctionality) {
          throw new Error('Failed to create project functionality')
        }

        return insertedFunctionality
      }),
    )

    return insertedFunctionalities
  })
}
