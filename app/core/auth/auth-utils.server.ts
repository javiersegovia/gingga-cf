import { AppLoadContext, redirect } from '@remix-run/cloudflare'
import { sessionKey } from './auth-service.server'
import { AuthSessionStorage } from './auth-session.server'

export async function getUserId(request: Request, context: AppLoadContext) {
  const { getSession, destroySession } = AuthSessionStorage.get(context)
  const authSession = await getSession(request.headers.get('cookie'))
  const sessionId = await authSession.get(sessionKey)

  if (!sessionId) return null
  const session = await context.db.query.Sessions.findFirst({
    where: (Sessions, { and, eq, gt }) =>
      and(eq(Sessions.id, sessionId), gt(Sessions.expirationDate, new Date())),
    columns: { userId: true },
    with: { user: { columns: { id: true } } },
  })

  if (!session?.user) {
    throw redirect('/', {
      headers: {
        'set-cookie': await destroySession(authSession),
      },
    })
  }

  return session?.userId
}

export async function requireUserId(
  request: Request,
  context: AppLoadContext,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request, context)

  if (!userId) {
    const requestUrl = new URL(request.url)
    redirectTo =
      redirectTo === null
        ? null
        : (redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`)
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
    const loginRedirect = ['/login', loginParams?.toString()]
      .filter(Boolean)
      .join('?')
    throw redirect(loginRedirect)
  }
  return userId
}

export async function requireAnonymous(
  request: Request,
  context: AppLoadContext,
) {
  const userId = await getUserId(request, context)
  if (userId) {
    throw redirect('/')
  }
}
