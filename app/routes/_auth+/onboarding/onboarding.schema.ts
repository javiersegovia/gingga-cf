import {
  FirstNameSchema,
  LastNameSchema,
  PasswordAndConfirmPasswordSchema,
} from '@/core/auth/user-schema'
import { z } from 'zod'

export const OnboardingSchema = z
  .object({
    firstName: FirstNameSchema,
    lastName: LastNameSchema,
    agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
      required_error:
        'You must agree to the terms of service and privacy policy',
    }),
    remember: z.boolean().optional(),
    redirectTo: z.string().optional(),
  })
  .and(PasswordAndConfirmPasswordSchema)
