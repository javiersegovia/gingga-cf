import { requireAnonymous } from '@/core/auth/auth.server'
import { verifySessionStorage } from '@/core/auth/verification.server'
import { db } from '@/db/db.server'
import { Users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { invariant } from '@epic-web/invariant'
import { json, redirect } from '@remix-run/cloudflare'
import type { VerifyFunctionArgs } from '../verify/verify.server'

export const resetPasswordEmailSessionKey = 'resetPasswordEmail'

export async function requireResetPasswordEmail(request: Request) {
  await requireAnonymous(request)
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie'),
  )

  const resetPasswordEmail = verifySession.get(resetPasswordEmailSessionKey)

  if (typeof resetPasswordEmail !== 'string' || !resetPasswordEmail) {
    throw redirect('/login')
  }
  return resetPasswordEmail
}

/**
 * @returns a redirect to the reset password page if the email is found,
 * otherwise, it returns an error
 */
export async function handleResetPasswordVerification({
  submission,
}: VerifyFunctionArgs) {
  invariant(
    submission.status === 'success',
    'Submission should be successful by now',
  )
  const target = submission.value.target
  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.email, target))
    .limit(1)

  // we don't want to say the user is not found if the email is not found
  // because that would allow an attacker to check if an email is registered
  if (!user) {
    return json(
      { result: submission.reply({ fieldErrors: { code: ['Invalid code'] } }) },
      { status: 400 },
    )
  }

  const verifySession = await verifySessionStorage.getSession()
  verifySession.set(resetPasswordEmailSessionKey, user.email)

  return redirect('/reset-password', {
    headers: {
      'set-cookie': await verifySessionStorage.commitSession(verifySession),
    },
  })
}
