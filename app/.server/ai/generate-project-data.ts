import { ProjectModuleSchema } from '@/schemas/project-schema'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { z } from 'zod'

export const systemPrompt = `You are a senior software developer and technical architect with extensive expertise in building websites and web applications, including SaaS platforms, e-commerce sites, and AI-powered products. You excel at analyzing project descriptions and devising step-by-step implementation plans focused on delivering a Minimum Viable Product (MVP). You communicate your findings in a clear and organized manner.

Your role is to analyze project descriptions provided by users and extract comprehensive information to facilitate effective roadmap planning and timeline creation based on the user's custom requirements.

When analyzing the project description, you should:

- **Extract Detailed Information**:
  - Identify the project's name, or suggest one if not provided.
  - Summarize the project with a focus on its intended functionalities, target users, and overall vision.
  - Determine the main technical objectives of the project.

- **Develop a Step-by-Step MVP Plan**:
  - Reason about the best steps to follow to create the MVP.
  - Outline a clear roadmap focused on implementing the most critical and important aspects first.
  - The plan should help shape the generation of the project modules.

- **Identify Modules for MVP**:
  - Based on the step-by-step plan, identify key modules or components essential for the MVP.
  - For each module, provide:
    - **Name**: The name of the module.
    - **Description**: A brief description of the module's functionality.
    - **Additional Info**: Any additional context that may be relevant to future development or AI processing.

- **Provide Organized Output**:
  - Present the extracted information in a structured format that includes the project name, description, main objectives, metadata, and modules.
  - Ensure the metadata includes objectives, tags, requirements, references, and any additional notes.

Your responses should reflect a thoughtful reasoning process, providing a logical sequence of steps to achieve the MVP. This will facilitate comprehensive software development planning.`

export const generateProjectDataPrompt = (
  projectIdeaDescription: string,
) => `Analyze the following product description provided by the user, which outlines a software development project for a website or web application:

${projectIdeaDescription}

From this description, please extract and provide comprehensive information focusing on the software development aspects:

1. **Project Name**:
   - Identify the project's name if mentioned, or suggest a suitable name based on the description.

2. **Description**:
   - Summarize the project with a powerful description, clearly stating the purpose of the software project, emphasizing the intended functionalities, target users, and overall vision.

3. **Main Objective**:
   - Focus on the technical aspects and goals of the product idea.

4. **Metadata**:
   - List the specific software development objectives or features that the project aims to achieve.
   - Provide tags that are keywords describing the project.
   - Include any technical requirements, user experience goals, performance criteria, or platform specifications.
   - Collect any additional information that could be relevant to the project, such as target audience, constraints, requirements, references, or additional notes.
   - The metadata should be provided in JSON format.

   Metadata example:
   """
   {
     "objectives": ["Feature 1", "Feature 2", "Feature 3"],
     "tags": ["tag1", "tag2", "tag3"],
     "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
     "references": ["Reference 1", "Reference 2", "Reference 3"],
     "notes": "Additional notes about the project"
   }
   """

5. **Step-by-Step MVP Plan**:
   - Develop a step-by-step plan focused on creating the MVP.
   - Reason about the best steps to follow, prioritizing the most critical and important aspects.
   - This plan should help shape the generation of the project modules.

6. **Modules**:
   - Based on the MVP plan, identify and list the key modules or components essential for the MVP.
   - For each module, provide:
     - **Name**: The name of the module.
     - **Description**: A brief description of the module's functionality.
     - **Additional Info**: Any additional context that may be relevant to future development or AI processing.
     - **Order**: The order of priority. Starts from zero.
   - Present the modules as an array in JSON format.

   Modules example:
   """
   [
     {
       "name": "User Authentication",
       "description": "Handles user sign-up, login, and authentication processes.",
       "additionalInfo": "Implement OAuth 2.0 for social logins in future phases.",
       "order": 0
     },
     {
       "name": "User Dashboard",
       "description": "Displays user-specific data and settings.",
       "additionalInfo": "Consider scalability for displaying real-time data.",
       "order": 1
     }
   ]
   """

Present the extracted information in a clear and organized format to facilitate detailed roadmap planning for software development.`

export const ProjectWithMetadataSchema = z.object({
  name: z
    .string()
    .describe(
      'The unique identifier or title of the project. Should be concise and descriptive.',
    ),
  description: z
    .string()
    .describe(
      "A comprehensive description of the project's purpose and functionality, including main features, target users, and overall vision.",
    ),
  additionalInfo: z
    .string()
    .describe(
      'Supplementary information about the project, including technical constraints, future considerations, or implementation notes.',
    ),
  mainObjective: z
    .string()
    .describe(
      'The primary technical goal or core purpose of the project from a technical perspective.',
    ),
  metadata: z
    .record(z.string(), z.any())
    .nullable()
    .describe(
      'A structured object containing project metadata including objectives, tags, requirements, references, and notes.',
    ),
  modules: z.array(ProjectModuleSchema.omit({ id: true })),
})

export const generateProjectData = async (
  apiKey: string,
  productIdea: string,
) => {
  const openrouter = createOpenRouter({
    apiKey,
  })

  const { object: projectData } = await generateObject({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    prompt: generateProjectDataPrompt(productIdea),
    system: systemPrompt,
    schema: ProjectWithMetadataSchema,
  })

  return projectData
}
