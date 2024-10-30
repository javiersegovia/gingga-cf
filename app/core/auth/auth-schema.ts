import { z } from 'zod'

export const FirstNameSchema = z
  .string({ required_error: 'First name is required' })
  .min(3, { message: 'First name is too short' })
  .max(40, { message: 'First name is too long' })

export const LastNameSchema = z
  .string({ required_error: 'Last name is required' })
  .min(3, { message: 'Last name is too short' })
  .max(40, { message: 'Last name is too long' })

export const EmailSchema = z
  .string({ required_error: 'Email is required' })
  .email({ message: 'Email is invalid' })
  .min(3, { message: 'Email is too short' })
  .max(100, { message: 'Email is too long' })
  // users can type the email in any case, but we store it in lowercase
  .transform((value) => value.toLowerCase())

export const LoginSchema = z.object({
  email: EmailSchema,
})

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'

const types = ['login', 'change-email'] as const
export const VerificationTypeSchema = z.enum(types)
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>

export const VerifySchema = z.object({
  [codeQueryParam]: z.string().min(6).max(6),
  [typeQueryParam]: VerificationTypeSchema,
  [targetQueryParam]: z.string(),
  [redirectToQueryParam]: z.string().optional(),
})
