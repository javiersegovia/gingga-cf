// import { VerificationEmail } from '@/core/email/templates/auth/verification-code'
import {
  AppLoadContext,
  createCookieSessionStorage,
  json,
  redirect,
  SessionData,
} from '@remix-run/cloudflare'
// import { VerificationTypes } from './auth-schema'
// import { getDomainUrl } from '../utils'
import { Sessions, Users, Verifications } from '@/db/schema'
// import { sendEmail } from '../email/email.server'
import { and, eq, gt } from 'drizzle-orm'
// import { TOTPStrategy } from 'remix-auth-totp'
// import { AuthSession } from './auth-service.server'
import {
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
  VerificationTypes,
  VerifySchema,
} from './auth-schema'
import { generateTOTP, verifyTOTP } from '@epic-web/totp'
import { getDomainUrl } from '../utils'
import { z } from 'zod'
import { Buffer } from 'node:buffer'
import { parseWithZod } from '@conform-to/zod'
import { invariant } from '@epic-web/invariant'
import { getSessionExpirationDate, sessionKey } from './auth.server'
import { AuthSessionStorage } from './auth-session.server'
import { safeRedirect } from 'remix-utils/safe-redirect'

// // eslint-disable-next-line import/no-extraneous-dependencies, @typescript-eslint/no-unused-vars
// import * as jose from 'jose'

export const onboardingEmailSessionKey = 'onboardingEmail' as const

export class VerifySessionStorage {
  private static instance: VerifySessionStorage
  private sessionStorage: ReturnType<
    typeof createCookieSessionStorage<SessionData, SessionData>
  >

  private constructor(private c: AppLoadContext) {
    this.sessionStorage = createCookieSessionStorage({
      cookie: {
        name: 'g_verification',
        sameSite: 'lax', // CSRF protection is advised if changing to 'none'
        path: '/',
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        secrets: [c.cloudflare.env.SESSION_SECRET],
        secure: c.cloudflare.env.NODE_ENV !== 'development',
      },
    })
  }

  static get(context: AppLoadContext) {
    if (!VerifySessionStorage.instance) {
      VerifySessionStorage.instance = new VerifySessionStorage(context)
    }
    return VerifySessionStorage.instance.sessionStorage
  }
}

export async function prepareVerification(
  context: AppLoadContext,
  {
    period,
    request,
    type,
    target,
  }: {
    period: number
    request: Request
    type: VerificationTypes
    target: string
  },
) {
  const verifyUrl = getRedirectToUrl({ request, type, target })
  const redirectTo = new URL(verifyUrl.toString())

  globalThis.Buffer = Buffer
  // globalThis.crypto = crypto

  const { otp, ...verificationConfig } = await generateTOTP({
    // Leaving off 0, O, and I on purpose to avoid confusing users.
    charSet: 'ABCDEGHJKLMNPQRSTUVWXYZ123456789',
    period,
  })

  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  }

  let userId: string | null = null

  if (type === 'login') {
    const [user] = await context.db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.email, target))
      .limit(1)

    userId = user?.id ?? null
  }

  await context.db
    .insert(Verifications)
    .values({ ...verificationData, userId })
    .onConflictDoUpdate({
      target: [Verifications.target, Verifications.type],
      set: { ...verificationData, userId },
    })

  // add the otp to the url we'll email the user.
  verifyUrl.searchParams.set(codeQueryParam, otp)
  return { otp, redirectTo, verifyUrl }
}

export async function isCodeValid(
  context: AppLoadContext,
  {
    code,
    type,
    target,
  }: {
    code: string
    type: VerificationTypes
    target: string
  },
) {
  const [verification] = await context.db
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

  if (!verification) return { success: false }

  const result = verifyTOTP({
    otp: code,
    ...verification,
  })
  if (!result) return { success: false }

  return {
    success: true,
  }
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

export async function validateRequest(
  request: Request,
  context: AppLoadContext,
  body: URLSearchParams | FormData,
) {
  const submission = await parseWithZod(body, {
    schema: VerifySchema.superRefine(async (data, ctx) => {
      const { success } = await isCodeValid(context, {
        code: data[codeQueryParam],
        type: data[typeQueryParam],
        target: data[targetQueryParam],
      })
      if (!success) {
        ctx.addIssue({
          path: ['code'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid code',
        })
        return
      }
      return { ...data }
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
    await context.db
      .delete(Verifications)
      .where(
        and(
          eq(Verifications.type, submissionValue[typeQueryParam]),
          eq(Verifications.target, submissionValue[targetQueryParam]),
        ),
      )
  }

  switch (submissionValue[typeQueryParam]) {
    case 'login': {
      await deleteVerification()
      invariant(
        submission.status === 'success',
        'Submission should be successful by now',
      )

      const verifySessionStorage = VerifySessionStorage.get(context)
      const verifySession = await verifySessionStorage.getSession()
      verifySession.set(onboardingEmailSessionKey, submission.value.target)

      const [user] = await context.db
        .select()
        .from(Users)
        .where(eq(Users.email, submission.value.target))
        .limit(1)
        .then(async (existing) => {
          if (existing.length) return existing
          return context.db
            .insert(Users)
            .values({
              email: submission.value.target,
            })
            .returning()
        })

      invariant(user, 'User should exist or be created by now')

      const [session] = await context.db
        .insert(Sessions)
        .values({
          // todo: extract "REMEMBER ME" from verification data
          expirationDate: getSessionExpirationDate(),
          userId: user.id,
        })
        .returning()

      const authSessionStorage = AuthSessionStorage.get(context)
      const authSession = await authSessionStorage.getSession(
        request.headers.get('cookie'),
      )
      authSession.set(sessionKey, session.id)

      const shouldOnboard = user?.firstName && user?.lastName
      const redirectTo = shouldOnboard ? '/onboarding' : '/ai'

      const headers = new Headers()

      headers.append(
        'set-cookie',
        await verifySessionStorage.destroySession(verifySession),
      )

      headers.append(
        'set-cookie',
        await authSessionStorage.commitSession(authSession, {
          expires: session.expirationDate, // todo: extract "REMEMBER ME" from verification data
        }),
      )

      return redirect(safeRedirect(redirectTo), {
        headers,
      })
    }

    case 'change-email': {
      await deleteVerification()
      // TODO - Implement change email
    }
  }
}

export async function requireOnboardingEmail(
  request: Request,
  context: AppLoadContext,
) {
  const verifySessionStorage = VerifySessionStorage.get(context)
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const email = verifySession.get(onboardingEmailSessionKey)

  if (typeof email !== 'string' || !email) {
    throw redirect('/login')
  }
  return email
}
