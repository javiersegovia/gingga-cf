import {
  ComplexityAssessmentCriteria,
  type ProjectModules,
  type ProjectFunctionalities,
  complexityAssessmentCriterionType,
  type ComplexityAssessmentCriterionType,
  FunctionalityTime,
} from '@/db/schema'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { AppLoadContext } from '@remix-run/cloudflare'

type ComplexityAssessmentPromptArgs = {
  projectFunctionality: Pick<
    typeof ProjectFunctionalities.$inferSelect,
    'name' | 'description' | 'id' | 'acceptanceCriteria'
  >
  projectModule: Pick<
    typeof ProjectModules.$inferSelect,
    'name' | 'description'
  >
}

const complexityAssessmentPrompt = ({
  projectFunctionality,
  projectModule,
}: ComplexityAssessmentPromptArgs) => {
  return `
You are an AI assistant analyzing software functionality complexity across five criteria. For each criterion, provide a score (1-10) and a concise justification.

---
**Functionality Name:** ${projectFunctionality.name}
**Functionality Description:** ${projectFunctionality.description}
**Module Name:** ${projectModule.name}
**Module Description:** ${projectModule.description}
**Acceptance Criteria:**
${projectFunctionality.acceptanceCriteria?.map((criterion) => `- ${criterion}`).join('\n')}
---

## Assessment Criteria ##

1. **Algorithmic Complexity**
- Logic complexity, data structures, optimization needs
- Score 1-3: Simple algorithms, basic control flow
- Score 4-6: Multiple logical branches, some optimization
- Score 7-10: Advanced algorithms, complex optimization

2. **Integration Requirements**
- External systems connectivity, data exchange
- Score 1-3: Simple internal integrations
- Score 4-6: External APIs with auth
- Score 7-10: Multiple complex integrations

3. **Dependencies**
- External libraries and services
- Score 1-3: Few stable dependencies
- Score 4-6: Multiple managed dependencies
- Score 7-10: Complex dependency chain

4. **Performance Requirements**
- Speed, efficiency, scalability needs
- Score 1-3: Standard performance
- Score 4-6: Specific targets needed
- Score 7-10: Critical optimization required

5. **Security Concerns**
- Data protection, compliance needs
- Score 1-3: Basic security
- Score 4-6: Enhanced security protocols
- Score 7-10: Critical security requirements

Response Format:
{
  "criteria": [
    {
      "type": "ALGORITHMIC_COMPLEXITY",
      "score": 2,
      "justification": "Simple data operations with standard input validation."
    },
    {
      "type": "INTEGRATION_REQUIREMENTS",
      "score": 5,
      "justification": "Requires authentication system integration and file storage handling with custom processing rules."
    },
    {
      "type": "SECURITY_CONCERNS",
      "score": 8,
      "justification": "Handles sensitive financial data requiring encryption, audit logging, rate limiting, and regulatory compliance. Requires security review and penetration testing."
    }
  ],
  "estimatedHours": 15,
  "explanation": "High-security financial feature with moderate external system requirements. While the core business logic is straightforward, strict security and compliance needs drive complexity. Main challenges include regulatory requirements, data protection protocols, and third-party integrations."
}

Analyze the functionality and provide:
1. Array of criteria assessments (type, score, justification)
2. Integer estimate of implementation hours
3. Brief explanation focusing on complexity drivers and challenges, avoiding specific implementation details

Estimated Hours:
- Low complexity (avg < 4): 5-10 hours
- Medium complexity (avg 4-7): 10-15 hours
- High complexity (avg > 7): 15-30 hours

Analyze the functionality and provide:
1. Array of criteria assessments (type, score, justification)
2. Integer estimate of implementation hours
3. Brief overall complexity explanation
`
}

const CriterionSchema = z.object({
  type: z
    .enum(complexityAssessmentCriterionType)
    .describe('The type of complexity assessment criterion'),
  score: z
    .number()
    .min(1)
    .max(10)
    .describe('The complexity score for this criterion, ranging from 1 to 10'),
  justification: z
    .string()
    .describe('A detailed explanation justifying the assigned score'),
})

const AssessmentSchema = z.object({
  criteria: z
    .array(CriterionSchema)
    .describe('An array of complexity assessment criteria'),
  estimatedHours: z
    .number()
    .describe('The estimated hours to implement the functionality'),
  explanation: z
    .string()
    .describe(
      'An overall explanation of the complexity assessment. It summarizes the most important aspects of each criterion.',
    ),
})

const criteriaWeights: Record<ComplexityAssessmentCriterionType, number> = {
  ALGORITHMIC_COMPLEXITY: 0.35,
  INTEGRATION_REQUIREMENTS: 0.2,
  DEPENDENCIES: 0.1,
  PERFORMANCE_REQUIREMENTS: 0.2,
  SECURITY_CONCERNS: 0.15,
}

function calculateCompositeComplexityScore(
  assessmentCriteria: z.infer<typeof CriterionSchema>[],
): number {
  const weightedScore = assessmentCriteria.reduce((acc, criterion) => {
    const weight = criteriaWeights[criterion.type]
    return acc + criterion.score * weight
  }, 0)

  // Round to two decimal places
  return Math.round(weightedScore * 100) / 100
}

type ComplexityMetricsArgs = {
  projectFunctionality: Pick<
    typeof ProjectFunctionalities.$inferSelect,
    'name' | 'description' | 'id' | 'acceptanceCriteria'
  >
  projectModule: Pick<
    typeof ProjectModules.$inferSelect,
    'name' | 'description'
  >
}

export async function generateComplexityMetrics(
  db: AppLoadContext['db'],
  { projectFunctionality, projectModule }: ComplexityMetricsArgs,
) {
  const prompt = complexityAssessmentPrompt({
    projectFunctionality,
    projectModule,
  })

  const { object: assessment } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: AssessmentSchema,
    prompt,
  })

  const { criteria, explanation, estimatedHours } = assessment
  const complexityScore = calculateCompositeComplexityScore(criteria)

  await db.transaction(async (tx) => {
    const [functionalityTime] = await tx
      .insert(FunctionalityTime)
      .values({
        projectFunctionalityId: projectFunctionality.id,
        complexityMetricScore: complexityScore,
        complexityExplanation: explanation,
        estimatedHours,
      })
      .returning({ id: FunctionalityTime.id })

    if (!functionalityTime) {
      throw new Error('Failed to generate functionality time')
    }

    await tx.insert(ComplexityAssessmentCriteria).values(
      criteria.map((criterion) => ({
        type: criterion.type,
        score: criterion.score,
        justification: criterion.justification,
        functionalityTimeId: functionalityTime.id,
      })),
    )
  })

  return { success: true }
}
