import type { Submission } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { json } from '@remix-run/cloudflare'
import { z } from 'zod'

import { handleOnboardingVerification } from '../onboarding/onboarding.server'
import { handleResetPasswordVerification } from '../reset-password/reset-password.server'
import {
  VerifySchema,
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
} from './verify.schema'
import type { VerificationTypes } from './verify.schema'

import { getDomainUrl } from '@/core/misc'
import { generateTOTP, verifyTOTP } from '@/core/totp.server'
import { db } from '@/db/db.server'
import { Verifications } from '@/db/schema'
import { and, eq, gt } from 'drizzle-orm'

export type VerifyFunctionArgs = {
  request: Request
  submission: Submission<
    z.input<typeof VerifySchema>,
    string[],
    z.output<typeof VerifySchema>
  >
  body: FormData | URLSearchParams
}

export function getRedirectToUrl({
  request,
  type,
  target,
  redirectTo,
}: {
  request: Request
  type: VerificationTypes
  target: string
  redirectTo?: string
}) {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`)
  redirectToUrl.searchParams.set(typeQueryParam, type)
  redirectToUrl.searchParams.set(targetQueryParam, target)
  if (redirectTo) {
    redirectToUrl.searchParams.set(redirectToQueryParam, redirectTo)
  }
  return redirectToUrl
}

// export async function requireRecentVerification(request: Request) {
// 	const userId = await requireUserId(request)
// 	const shouldReverify = await shouldRequestTwoFA(request)
// 	if (shouldReverify) {
// 		const reqUrl = new URL(request.url)
// 		const redirectUrl = getRedirectToUrl({
// 			request,
// 			target: userId,
// 			type: twoFAVerificationType,
// 			redirectTo: reqUrl.pathname + reqUrl.search,
// 		})
// 		throw await redirectWithToast(redirectUrl.toString(), {
// 			title: 'Please Reverify',
// 			description: 'Please reverify your account before proceeding',
// 		})
// 	}
// }

export async function prepareVerification({
  period,
  request,
  type,
  target,
}: {
  period: number
  request: Request
  type: VerificationTypes
  target: string
}) {
  const verifyUrl = getRedirectToUrl({ request, type, target })
  const redirectTo = new URL(verifyUrl.toString())

  const { otp, ...verificationConfig } = generateTOTP({
    algorithm: 'SHA256',
    // Leaving off 0, O, and I on purpose to avoid confusing users.
    charSet: 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789',
    period,
  })
  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  }

  await db
    .insert(Verifications)
    .values(verificationData)
    .onConflictDoUpdate({
      target: [Verifications.target, Verifications.type],
      set: verificationData,
    })

  // add the otp to the url we'll email the user.
  verifyUrl.searchParams.set(codeQueryParam, otp)

  return { otp, redirectTo, verifyUrl }
}

export async function isCodeValid({
  code,
  type,
  target,
}: {
  code: string
  type: VerificationTypes
  target: string
}) {
  const [verification] = await db
    .select()
    .from(Verifications)
    .where(
      and(
        eq(Verifications.target, target),
        eq(Verifications.type, type),
        gt(Verifications.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!verification) return false

  const result = verifyTOTP({
    otp: code,
    ...verification,
  })
  if (!result) return false

  return true
}

export async function validateRequest(
  request: Request,
  body: URLSearchParams | FormData,
) {
  const submission = await parseWithZod(body, {
    schema: VerifySchema.superRefine(async (data, ctx) => {
      const codeIsValid = await isCodeValid({
        code: data[codeQueryParam],
        type: data[typeQueryParam],
        target: data[targetQueryParam],
      })
      if (!codeIsValid) {
        ctx.addIssue({
          path: ['code'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid code',
        })
        return
      }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { value: submissionValue } = submission

  async function deleteVerification() {
    await db
      .delete(Verifications)
      .where(
        and(
          eq(Verifications.type, submissionValue[typeQueryParam]),
          eq(Verifications.target, submissionValue[targetQueryParam]),
        ),
      )
  }

  switch (submissionValue[typeQueryParam]) {
    case 'reset-password': {
      await deleteVerification()
      return handleResetPasswordVerification({ request, body, submission })
    }

    case 'onboarding': {
      await deleteVerification()
      return handleOnboardingVerification({ request, body, submission })
    }

    case 'change-email': {
      await deleteVerification()
      // TODO - 1
      // Implement change email verification
      // return handleChangeEmailVerification({ request, body, submission })
    }
  }
}
