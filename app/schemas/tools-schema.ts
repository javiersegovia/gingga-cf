import { z } from 'zod'

export const CustomToolResponseSchema = z.object({
  success: z.boolean(),
  result: z.any(),
  error: z.string().optional(),
})

export const CustomToolArgsSchema = z.object({
  toolAction: z.string(),
})

export type CustomToolResponse = z.infer<typeof CustomToolResponseSchema>
export type CustomToolArgs = z.infer<typeof CustomToolArgsSchema>
