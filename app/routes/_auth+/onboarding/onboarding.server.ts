import { requireAnonymous } from '@/core/auth/auth.server'
import { verifySessionStorage } from '@/core/auth/verification.server'
import { invariant } from '@epic-web/invariant'
import { redirect } from '@remix-run/cloudflare'
import type { VerifyFunctionArgs } from '../verify/verify.server'

export const onboardingEmailSessionKey = 'onboardingEmail'

export async function requireOnboardingEmail(request: Request) {
  await requireAnonymous(request)
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const email = verifySession.get(onboardingEmailSessionKey)
  if (typeof email !== 'string' || !email) {
    throw redirect('/register')
  }
  return email
}

export async function handleOnboardingVerification({
  submission,
}: VerifyFunctionArgs) {
  invariant(
    submission.status === 'success',
    'Submission should be successful by now',
  )

  const verifySession = await verifySessionStorage.getSession()
  verifySession.set(onboardingEmailSessionKey, submission.value.target)

  return redirect('/onboarding', {
    headers: {
      'set-cookie': await verifySessionStorage.commitSession(verifySession),
    },
  })
}
