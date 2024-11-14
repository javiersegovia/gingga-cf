import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { generateObject, tool } from 'ai'
import { SchemaSQLString } from '@/db/schema-sql-string'
import { sql } from 'drizzle-orm'
import { CustomToolResponse } from '@/schemas/tools-schema'
import { AppLoadContext } from '@remix-run/cloudflare'

const systemPrompt = `You are a SQL (postgres) expert specialized in safe, efficient querying. Your job is to write SQL queries that return structured data for further AI processing. The table schema is as follows:

${SchemaSQLString}

STRICT QUERY GUIDELINES:
1. ONLY retrieval queries (SELECT) are allowed
2. ALWAYS include WHERE project_id = :projectId
3. LIMIT results to 100 rows maximum
4. AVOID complex joins unless absolutely necessary
5. PREFER simple queries over complex ones
6. NEVER use SELECT *
7. ALWAYS alias tables and columns clearly
8. INCLUDE relevant ID columns for relationships

PERFORMANCE RULES:
1. Use appropriate indexes (id, project_id fields)
2. Avoid cross joins
3. Minimize the number of joins (max 2-3 tables)
4. Be specific about which columns you need
5. Use WHERE clauses before JOINs when possible

DATA TYPE HANDLING:
1. Arrays: Use unnest() or array_to_string() for text[]
2. Timestamps: Return in ISO format
3. Numbers: Use COALESCE for nullable numbers
4. Text: Use LOWER() for case-insensitive searches

EXAMPLE QUERIES:

1. Simple Project Info:
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.description as project_description
FROM projects p
WHERE p.id = :projectId
LIMIT 100;

2. Module List with Time Estimates:
SELECT 
    pm.id as module_id,
    pm.name as module_name,
    COALESCE(mt.estimated_hours, 0) as estimated_hours
FROM project_modules pm
LEFT JOIN module_time mt ON mt.project_module_id = pm.id
WHERE pm.project_id = :projectId
ORDER BY pm.order ASC
LIMIT 100;

3. Functionality Complexity:
SELECT 
    pf.id as functionality_id,
    pf.name as functionality_name,
    pf.type as functionality_type,
    COALESCE(ft.complexity_metric_score, 0) as complexity_score
FROM project_functionalities pf
LEFT JOIN functionality_time ft ON ft.project_functionality_id = pf.id
WHERE pf.project_id = :projectId
LIMIT 100;

4. Timeline Items by Month:
SELECT 
    ti.month_number,
    ti.title,
    ti.summary
FROM project_timelines pt
JOIN timeline_items ti ON ti.project_timeline_id = pt.id
WHERE pt.project_id = :projectId
ORDER BY ti.month_number ASC
LIMIT 100;

5. Module with Acceptance Criteria:
SELECT 
    pf.id as functionality_id,
    pf.name as functionality_name,
    array_to_string(pf.acceptance_criteria, ', ') as acceptance_criteria
FROM project_functionalities pf
WHERE pf.project_id = :projectId
LIMIT 100;

COMMON MISTAKES TO AVOID:
1. ❌ Joining too many tables:
   SELECT * FROM project_timelines pt
   JOIN timeline_items ti ON pt.id = ti.project_timeline_id
   JOIN project_modules pm ON pm.project_id = pt.project_id
   JOIN module_time mt ON pm.id = mt.project_module_id
   JOIN project_functionalities pf ON pf.project_id = pt.project_id;

2. ❌ Missing project_id filter:
   SELECT * FROM project_modules;

3. ❌ Using SELECT *:
   SELECT * FROM projects WHERE id = :projectId;

4. ❌ Not using LIMIT:
   SELECT id, name FROM projects WHERE project_id = :projectId;

5. ❌ Improper array handling:
   SELECT acceptance_criteria FROM project_functionalities;

RESPONSE FORMAT:
Return ONLY a JSON object with a 'query' property containing the SQL query.
Example: { "query": "SELECT id, name FROM projects WHERE id = :projectId LIMIT 100" }

Remember: Safety and simplicity over complexity. When in doubt, return less data with a simpler query.`

async function generateQuery(input: string, projectId: string, apiKey: string) {
  try {
    const openai = createOpenAI({
      apiKey,
    })

    console.log('Query input:')
    console.log(input)

    const result = await generateObject({
      schema: z.object({
        query: z.string().describe(`The SQL query to execute`),
      }),
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Generate the query necessary to retrieve the data the user wants: ${input}. Only retrieve data related to the project with id: ${projectId}`,
    })

    console.log('Generated query:')
    console.log(result.object.query)

    return { success: true, result: result.object.query }
  } catch (e) {
    console.error(e)
    return { success: false, error: 'Failed to generate query' }
  }
}

interface QueryProjectToolParams {
  projectId: string
  db: AppLoadContext['db']
  apiKey: string
}
export function queryProjectTool({
  projectId,
  db,
  apiKey,
}: QueryProjectToolParams) {
  return tool({
    description:
      'Generate and execute a SQL query to retrieve information related to a project.',
    parameters: z.object({
      question: z.string().describe('The question the user is asking.'),
      toolAction: z
        .string()
        .describe(
          'A short phrase that describes what the AI is doing. Example: Retrieving and analyzing module start dates...',
        ),
    }),
    execute: async ({ question }): Promise<CustomToolResponse> => {
      // Generate the query
      const {
        success: genSuccess,
        result: queryString,
        error: genError,
      } = await generateQuery(question, projectId, apiKey)

      if (!genSuccess || !queryString) {
        return {
          success: false,
          error: genError || 'Failed to generate the SQL query',
        }
      }

      // Execute the generated query
      try {
        const queryResult = await db.execute(sql.raw(queryString))

        return { success: true, result: queryResult.rows }
      } catch (e) {
        console.error(e)
        return {
          success: false,
          error: 'Failed to retrieve information from the database',
        }
      }
    },
  })
}
