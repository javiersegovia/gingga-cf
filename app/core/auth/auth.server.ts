import { Users, Sessions, Connections, Roles, UserRoles } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { AppLoadContext, redirect } from '@remix-run/cloudflare'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { combineHeaders } from '../utils'
import { AuthSessionStorage } from './auth-session.server'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export async function signup(
  context: AppLoadContext,
  {
    email,
    firstName,
    lastName,
  }: {
    email: string
    firstName: string
    lastName: string
  },
) {
  const [user] = await context.db
    .insert(Users)
    .values({
      email: email.toLowerCase(),
      firstName,
      lastName,
    })
    .returning({ id: Users.id })

  if (!user) return null

  const userRole = await context.db.query.Roles.findFirst({
    where: eq(Roles.name, 'user'),
  })
  if (userRole) {
    await context.db.insert(UserRoles).values({
      userId: user.id,
      roleId: userRole.id,
    })
  }

  const [session] = await context.db
    .insert(Sessions)
    .values({
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    })
    .returning()

  return session
}

export async function signupWithConnection(
  context: AppLoadContext,
  {
    email,
    firstName,
    lastName,
    providerId,
    providerName,
    imageUrl,
  }: {
    email: string
    firstName: string
    lastName: string
    providerId: string
    providerName: string
    imageUrl?: string
  },
) {
  const [user] = await context.db
    .insert(Users)
    .values({
      email: email.toLowerCase(),
      firstName,
      lastName,
    })
    .returning({ id: Users.id })

  if (!user) return null

  await context.db.insert(Connections).values({
    providerId,
    providerName,
    userId: user.id,
  })

  if (imageUrl) {
    // Implement image download and storage logic here
    // This might involve using a separate image storage service
  }

  const [session] = await context.db
    .insert(Sessions)
    .values({
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    })
    .returning()

  return session
}

export async function logout(
  request: Request,
  context: AppLoadContext,
  redirectTo = '/',
  responseInit?: ResponseInit,
) {
  const authSessionStorage = AuthSessionStorage.get(context)

  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)

  if (sessionId) {
    await context.db.delete(Sessions).where(eq(Sessions.id, sessionId))
  }

  return redirect(safeRedirect(redirectTo), {
    ...responseInit,
    headers: combineHeaders(
      { 'set-cookie': await authSessionStorage.destroySession(authSession) },
      responseInit?.headers,
    ),
  })
}
