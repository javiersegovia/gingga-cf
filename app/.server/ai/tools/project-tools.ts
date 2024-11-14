import { AppLoadContext } from '@remix-run/cloudflare'
import { tool } from 'ai'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import * as schema from '@/db/schema'

interface ProjectQueryToolsParams {
  db: AppLoadContext['db']
  projectId: string
}

export function createProjectQueryTools({
  db,
  projectId,
}: ProjectQueryToolsParams) {
  // Base tool for querying modules
  const queryModulesTool = tool({
    description:
      'Query project modules with their time estimates and functionalities.',
    parameters: z.object({
      includeModuleTime: z
        .literal(true)
        .optional()
        .describe('Include time and complexity metrics for each module'),
      includeFunctionalities: z
        .literal(true)
        .optional()
        .describe('Include related functionalities'),
      includeFunctionalityTime: z
        .literal(true)
        .optional()
        .describe('Include time and complexity metrics for each functionality'),
      toolAction: z
        .string()
        .describe('A short phrase describing what the AI is doing'),
    }),
    execute: async ({
      includeModuleTime,
      includeFunctionalities,
      includeFunctionalityTime,
    }) => {
      try {
        const modules = await db.query.ProjectModules.findMany({
          where: eq(schema.ProjectModules.projectId, projectId),
          with: {
            moduleTime: includeModuleTime,
            functionalities: includeFunctionalities
              ? {
                  with: {
                    functionalityTime: includeFunctionalityTime,
                  },
                }
              : undefined,
          },
          orderBy: desc(schema.ProjectModules.order),
        })
        return { success: true, result: modules }
      } catch (error) {
        console.error('Failed to query modules:', error)
        return { success: false, error: 'Failed to query project modules' }
      }
    },
  })

  // Tool for querying functionalities
  const queryFunctionalitiesTool = tool({
    description:
      'Query project functionalities with their complexity metrics and test cases.',
    parameters: z.object({
      moduleId: z.string().optional().describe('Filter by specific module ID'),
      type: z
        .enum(schema.projectFunctionalityType)
        .optional()
        .describe('Filter by functionality type'),
      includeTestCases: z
        .literal(true)
        .optional()
        .describe('Include test cases'),
      includeTime: z
        .literal(true)
        .optional()
        .describe('Include time and complexity metrics'),
      toolAction: z
        .string()
        .describe('A short phrase describing what the AI is doing'),
    }),
    execute: async ({ moduleId, type, includeTestCases, includeTime }) => {
      try {
        const filters = [eq(schema.ProjectFunctionalities.projectId, projectId)]
        if (moduleId)
          filters.push(
            eq(schema.ProjectFunctionalities.projectModuleId, moduleId),
          )
        if (type) filters.push(eq(schema.ProjectFunctionalities.type, type))

        const functionalities = await db.query.ProjectFunctionalities.findMany({
          where: and(...filters),
          with: {
            testCases: includeTestCases,
            functionalityTime: includeTime,
          },
        })
        return { success: true, result: functionalities }
      } catch (error) {
        console.error('Failed to query functionalities:', error)
        return {
          success: false,
          error: 'Failed to query project functionalities',
        }
      }
    },
  })

  // Tool for querying project timeline
  const queryTimelineTool = tool({
    description: 'Query project timeline with related modules.',
    parameters: z.object({
      includeModules: z
        .literal(true)
        .optional()
        .describe('Include related modules'),
      toolAction: z
        .string()
        .describe('A short phrase describing what the AI is doing'),
    }),
    execute: async ({ includeModules }) => {
      try {
        const timeline = await db.query.ProjectTimelines.findFirst({
          where: eq(schema.ProjectTimelines.projectId, projectId),
          with: {
            timelineItems: {
              with: {
                timelineItemToProjectModules: includeModules
                  ? {
                      with: {
                        projectModule: true,
                      },
                    }
                  : undefined,
              },
            },
          },
        })
        return { success: true, result: timeline }
      } catch (error) {
        console.error('Failed to query timeline:', error)
        return { success: false, error: 'Failed to query project timeline' }
      }
    },
  })

  return {
    queryModulesTool,
    queryFunctionalitiesTool,
    queryTimelineTool,
  }
}
