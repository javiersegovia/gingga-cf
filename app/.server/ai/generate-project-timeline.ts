import {
  ProjectTimelines,
  TimelineItems,
  TimelineItemsToProjectModules,
} from '@/db/schema'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { AppLoadContext } from '@remix-run/cloudflare'

// Constants
const WORKING_HOURS_PER_MONTH = 160

// Types
type ProjectModule = {
  name: string
  description: string
  additionalInfo?: string | null
  order?: number | null
  estimatedHours?: number | null
  functionalities: Array<{
    name: string
    description: string
    estimatedHours?: number | null
  }>
}

type ExtendedProjectModule = ProjectModule & {
  isPartial?: boolean
  continuesNextMonth?: boolean
}

type MonthlyData = {
  monthNumber: number
  modules: ExtendedProjectModule[]
  continuedModules: ProjectModule[]
}

type TimelineCalculationResult = {
  totalEstimatedHours: number
  estimatedMonths: number
  modulesByMonth: MonthlyData[]
}

async function calculateTimelineData(
  modules: ProjectModule[],
): Promise<TimelineCalculationResult> {
  const totalEstimatedHours = modules.reduce((total, module) => {
    return total + (module.estimatedHours || 0)
  }, 0)

  const estimatedMonths = Math.ceil(
    totalEstimatedHours / WORKING_HOURS_PER_MONTH,
  )
  const modulesByMonth: MonthlyData[] = []

  // Initialize all months
  for (let i = 1; i <= estimatedMonths; i++) {
    modulesByMonth.push({
      monthNumber: i,
      modules: [],
      continuedModules: [],
    })
  }

  let currentMonth = 0
  let currentMonthHours = 0

  // Distribute modules across months
  for (const module of modules) {
    const moduleHours = module.estimatedHours || 0

    // If this module would exceed current month's hours
    if (currentMonthHours + moduleHours > WORKING_HOURS_PER_MONTH) {
      // Check if module needs to be split across months
      const remainingHours = WORKING_HOURS_PER_MONTH - currentMonthHours
      if (remainingHours > WORKING_HOURS_PER_MONTH * 0.2) {
        // At least 20% of month remaining
        const monthData = modulesByMonth[currentMonth]
        if (monthData) {
          // Add to current month and mark as continuing
          monthData.modules.push({
            ...module,
            isPartial: true,
            continuesNextMonth: true,
          })

          // Add to next month as a continued module
          const nextMonthData = modulesByMonth[currentMonth + 1]
          if (nextMonthData) {
            nextMonthData.continuedModules.push(module)
          }
        }
      } else {
        // Move to next month entirely
        currentMonth++
        currentMonthHours = moduleHours
        const monthData = modulesByMonth[currentMonth]
        if (monthData) {
          monthData.modules.push(module)
        }
      }
    } else {
      // Add to current month
      const monthData = modulesByMonth[currentMonth]
      if (monthData) {
        monthData.modules.push(module)
        currentMonthHours += moduleHours
      }
    }
  }

  return {
    totalEstimatedHours,
    estimatedMonths,
    modulesByMonth,
  }
}

const systemPrompt = `You are a seasoned technical architect and digital transformation expert with extensive experience in delivering high-impact software solutions. Your expertise lies in creating strategic implementation roadmaps that align technical excellence with business value.

Your task is to analyze the provided project details and create an engaging, value-focused timeline that demonstrates our technical expertise while highlighting the transformative impact of each phase.

Example Response:
{
  "summary": "This innovative digital platform represents a strategic investment in cutting-edge technology, carefully architected to deliver exceptional value and scalability. The project embraces modern development practices and industry-leading technologies to create a robust, future-proof solution. Our carefully planned 6-month implementation roadmap ensures a methodical, quality-focused delivery approach, with each phase building upon a solid foundation of best practices and architectural excellence. The solution incorporates advanced features including real-time processing capabilities, intelligent automation, and enterprise-grade security measures, positioning it as a transformative digital asset with significant growth potential.",
  "timelineItems": [
    {
      "monthNumber": 1,
      "title": "Foundation and Core Architecture Implementation",
      "summary": "Establishing the project's architectural foundation with industry-leading practices and patterns. This phase focuses on implementing the Authentication Module's robust security framework and the Database Module's scalable data architecture. We'll leverage cutting-edge technologies to ensure exceptional performance and security, while setting the stage for rapid feature development in subsequent phases. This foundational work will enable seamless integration of future enhancements and ensure long-term maintainability.",
      "modules": ["Authentication Module", "Database Module"]
    },
    {
      "monthNumber": 2,
      "title": "Advanced Feature Development and Integration",
      "summary": "Building upon our solid foundation, this phase continues the Authentication Module implementation while introducing the Product Module's sophisticated catalog system. The focus remains on delivering exceptional user experiences through carefully crafted interfaces and optimized performance. This phase demonstrates our commitment to quality and attention to detail, ensuring each feature adds meaningful value to the platform.",
      "modules": ["Authentication Module", "Product Module"]
    }
  ]
}

Key aspects of the response:
1. The summary should:
   - Emphasize technical excellence and innovation
   - Highlight the strategic value and future potential
   - Demonstrate understanding of business impact
   - Maintain professional tone while subtly showcasing expertise

2. Each timeline item should:
   - Focus on value delivery and technical quality
   - Highlight the sophistication of implementation
   - Show continuity between phases when modules span multiple months
   - Emphasize best practices and technical excellence

Your responses should be professional, technically precise, and formatted in JSON for parsing.`

// Define the user prompt function
type ProjectTimelinePromptProps = {
  description: string
  mainObjective: string
  metadata?: string | null
  modules: ProjectModule[]
  timelineData?: TimelineCalculationResult
}

const projectTimelinePrompt = ({
  description,
  mainObjective,
  metadata,
  timelineData,
}: ProjectTimelinePromptProps) => {
  return `Based on the following project details and time estimates, generate a comprehensive project timeline.

**Project Description**:
${description}

**Project Main Objective**:
${mainObjective}

**Time Estimates**:
- Total Estimated Hours: ${timelineData?.totalEstimatedHours || 'Not specified'}
- Estimated Months: ${timelineData?.estimatedMonths || 'Not specified'}
- Working Hours per Month: ${WORKING_HOURS_PER_MONTH}

**Metadata**:
${metadata || 'None'}

**Project Modules and Functionalities by Month**:
${timelineData?.modulesByMonth
  .map(
    (monthData) => `
Month ${monthData.monthNumber}:
${monthData.modules
  .map(
    (module) => `
- Module: ${module.name}
  Description: ${module.description}
  Estimated Hours: ${module.estimatedHours || 'Not specified'}
  Functionalities:
${module.functionalities
  .map(
    (func) => `    - ${func.name}
      Description: ${func.description}
      Estimated Hours: ${func.estimatedHours || 'Not specified'}`,
  )
  .join('\n')}`,
  )
  .join('\n')}`,
  )
  .join('\n')}

**Instructions**:

1. **Project Summary**:
   - Provide a detailed summary of the project, incorporating the main objective, description, metadata, modules, and functionalities.
   - Include time considerations and overall project duration.

2. **Timeline Generation**:
   - Create monthly segments based on the provided time estimates and module distribution.
   - For each month, include:
     - **Month Number**: The sequential number of the month.
     - **Title**: A concise title summarizing the month's focus.
     - **Summary**: A detailed description of the modules and functionalities to be worked on during that month.
     - **Modules**: List the modules assigned to this month.

3. **Considerations**:
   - Use logical sequencing based on module dependencies and priorities.
   - Ensure the workload is balanced across months (${WORKING_HOURS_PER_MONTH} hours per month).
   - Consider the total project duration of ${timelineData?.estimatedMonths || 'Not specified'} months.

4. **Output Format**:
   - Provide the project summary as a string.
   - Present the timeline as an array of items in JSON format.
   - Each item should include the fields: monthNumber, title, summary, modules.

Generate the project timeline now.`
}

// Define the schema for the AI's output
const TimelineItemSchema = z.object({
  monthNumber: z
    .number()
    .int()
    .positive()
    .describe('The sequential number of the month'),
  title: z.string().describe("A concise title summarizing the month's focus"),
  summary: z.string().describe('Detailed description of work for the month'),
  modules: z
    .array(z.string())
    .describe('List of modules assigned to this month'),
})

const ProjectTimelineSchema = z.object({
  summary: z.string().describe('A detailed summary of the project'),
  timelineItems: z.array(TimelineItemSchema),
})

export async function generateProjectTimeline(
  context: AppLoadContext,
  projectId: string,
) {
  const { db, cloudflare } = context

  const project = await db.query.Projects.findFirst({
    where: (p, { eq }) => eq(p.id, projectId),
    columns: {
      description: true,
      mainObjective: true,
      metadata: true,
    },
    with: {
      modules: {
        columns: {
          id: true,
          name: true,
          description: true,
          additionalInfo: true,
          order: true,
        },
        with: {
          functionalities: {
            columns: {
              name: true,
              description: true,
            },
            with: {
              functionalityTime: {
                columns: {
                  estimatedHours: true,
                },
              },
            },
          },
          moduleTime: {
            columns: {
              estimatedHours: true,
            },
          },
        },
      },
    },
  })

  if (!project) {
    throw new Error('Project not found')
  }

  // Filter valid modules (has functionalities and estimatedHours)
  const validModules = project.modules
    .filter(
      (module) =>
        !!module.moduleTime?.estimatedHours &&
        module.functionalities.length > 0,
    )
    .map((module) => ({
      name: module.name,
      description: module.description,
      additionalInfo: module.additionalInfo,
      order: module.order,
      estimatedHours: module.moduleTime?.estimatedHours,
      functionalities: module.functionalities.map((func) => ({
        name: func.name,
        description: func.description,
        estimatedHours: func.functionalityTime?.estimatedHours,
      })),
    }))

  // Prepare data for the prompt and timeline calculation
  const promptData: ProjectTimelinePromptProps = {
    description: project.description,
    mainObjective: project.mainObjective,
    metadata: project.metadata
      ? JSON.stringify(project.metadata, null, 2)
      : undefined,
    modules: validModules,
  }

  // Calculate timeline data using the filtered modules
  const timelineData = await calculateTimelineData(validModules)

  // Generate the user prompt with timeline data
  const userPrompt = projectTimelinePrompt({
    ...promptData,
    timelineData,
  })

  const aiClient = createOpenAI({
    apiKey: context.cloudflare.env.OPENAI_API_KEY,
  })

  // Call the AI model
  const { object: projectTimeline } = await generateObject({
    model: aiClient('gpt-4o'),
    prompt: userPrompt,
    system: systemPrompt,
    output: 'object',
    schema: ProjectTimelineSchema,
  })

  console.info('~~~~~~~~~~~~~~~AI generated project timeline~~~~~~~~~~~~~~~')
  console.log(JSON.stringify(projectTimeline, null, 2))
  console.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

  // Insert the generated timeline into the database
  return db.transaction(async (tx) => {
    // Insert the ProjectTimeline
    const [insertedTimeline] = await tx
      .insert(ProjectTimelines)
      .values({
        projectId,
        summary: projectTimeline.summary,
      })
      .returning()

    if (!insertedTimeline) {
      throw new Error('Failed to create project timeline')
    }

    // Insert the TimelineItems
    for (const item of projectTimeline.timelineItems) {
      const [insertedItem] = await tx
        .insert(TimelineItems)
        .values({
          projectTimelineId: insertedTimeline.id,
          monthNumber: item.monthNumber,
          title: item.title,
          summary: item.summary,
          type: 'BASIC',
        })
        .returning()

      if (!insertedItem) {
        throw new Error('Failed to create timeline item')
      }

      // Optionally, associate ProjectModules with TimelineItems
      for (const moduleName of item.modules) {
        const module = project.modules.find((m) => m.name === moduleName)
        if (module) {
          await tx.insert(TimelineItemsToProjectModules).values({
            timelineItemId: insertedItem.id,
            projectModuleId: module.id,
          })
        }
      }
    }

    return insertedTimeline
  })
}
