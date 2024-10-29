import { sessionKey } from '@/core/auth/auth.server'
import { authSessionStorage } from '@/core/auth/session.server'
import { verifySessionStorage } from '@/core/auth/verification.server'
import { combineResponseInits } from '@/core/misc'
import { redirectWithToast } from '@/core/toast.server'
import { db } from '@/db/db.server'
import { Sessions } from '@/db/schema'
import type { VerifyFunctionArgs } from '@/routes/_auth+/verify/verify.server'
import { invariant } from '@epic-web/invariant'
import { redirect } from '@remix-run/cloudflare'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { eq } from 'drizzle-orm'

const verifiedTimeKey = 'verified-time'
const unverifiedSessionIdKey = 'unverified-session-id'
const rememberKey = 'remember'

export async function handleNewSession(
  {
    request,
    session,
    redirectTo,
    remember,
  }: {
    request: Request
    session: { userId: string; id: string; expirationDate: Date }
    redirectTo?: string
    remember: boolean
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  authSession.set(sessionKey, session.id)

  return redirect(
    safeRedirect(redirectTo),
    combineResponseInits(
      {
        headers: {
          'set-cookie': await authSessionStorage.commitSession(authSession, {
            expires: remember ? session.expirationDate : undefined,
          }),
        },
      },
      responseInit,
    ),
  )
}

export async function handleVerification({
  request,
  submission,
}: VerifyFunctionArgs) {
  invariant(
    submission.status === 'success',
    'Submission should be successful by now',
  )
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie'),
  )

  const remember = verifySession.get(rememberKey)
  const { redirectTo } = submission.value
  const headers = new Headers()
  authSession.set(verifiedTimeKey, Date.now())

  const unverifiedSessionId = verifySession.get(unverifiedSessionIdKey)
  if (unverifiedSessionId) {
    const session = await db
      .select()
      .from(Sessions)
      .where(eq(Sessions.id, unverifiedSessionId))
      .limit(1)
    if (!session[0]) {
      throw await redirectWithToast('/login', {
        toastType: 'error',
        title: 'Invalid session',
        description: 'Could not find session to verify. Please try again.',
      })
    }
    authSession.set(sessionKey, unverifiedSessionId)

    headers.append(
      'set-cookie',
      await authSessionStorage.commitSession(authSession, {
        expires: remember ? session[0].expirationDate : undefined,
      }),
    )
  } else {
    headers.append(
      'set-cookie',
      await authSessionStorage.commitSession(authSession),
    )
  }

  headers.append(
    'set-cookie',
    await verifySessionStorage.destroySession(verifySession),
  )

  return redirect(safeRedirect(redirectTo), { headers })
}
