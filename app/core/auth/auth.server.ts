import { db } from '@/db/db.server'
import {
  Users,
  Passwords,
  Sessions,
  Connections,
  Roles,
  UserRoles,
} from '@/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from '@remix-run/cloudflare'
import bcrypt from 'bcryptjs'
import { Authenticator } from 'remix-auth'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { combineHeaders } from '../misc'
import { connectionSessionStorage, providers } from './connections.server'
import type { ProviderUser } from './providers/provider'
import { authSessionStorage } from './session.server'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export const authenticator = new Authenticator<ProviderUser>(
  connectionSessionStorage,
)

for (const [providerName, provider] of Object.entries(providers)) {
  authenticator.use(provider.getAuthStrategy(), providerName)
}

export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  if (!sessionId) return null
  const session = await db.query.Sessions.findFirst({
    where: (sessions, { and, eq, gt }) =>
      and(eq(sessions.id, sessionId), gt(sessions.expirationDate, new Date())),
    columns: { userId: true },
    with: { user: { columns: { id: true } } },
  })

  if (!session?.user) {
    throw redirect('/', {
      headers: {
        'set-cookie': await authSessionStorage.destroySession(authSession),
      },
    })
  }
  return session.user.id
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request)
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

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request)
  if (userId) {
    throw redirect('/')
  }
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = await verifyUserPassword({ email }, password)
  if (!user) return null
  const [session] = await db
    .insert(Sessions)
    .values({
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    })
    .returning()
  return session
}

export async function resetUserPassword({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)

  const user = await db.query.Users.findFirst({
    where: eq(Users.email, email),
    columns: { id: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  await db
    .update(Passwords)
    .set({
      hash: hashedPassword,
    })
    .where(eq(Passwords.userId, user.id))
}

export async function signup({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string
  firstName: string
  lastName: string
  password: string
}) {
  const hashedPassword = await getPasswordHash(password)

  const [user] = await db
    .insert(Users)
    .values({
      email: email.toLowerCase(),
      firstName,
      lastName,
    })
    .returning({ id: Users.id })

  if (!user) return null

  await db.insert(Passwords).values({
    hash: hashedPassword,
    userId: user.id,
  })

  const userRole = await db.query.Roles.findFirst({
    where: eq(Roles.name, 'user'),
  })
  if (userRole) {
    await db.insert(UserRoles).values({ userId: user.id, roleId: userRole.id })
  }

  const [session] = await db
    .insert(Sessions)
    .values({
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    })
    .returning()

  return session
}

export async function signupWithConnection({
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
}) {
  const [user] = await db
    .insert(Users)
    .values({
      email: email.toLowerCase(),
      firstName,
      lastName,
    })
    .returning({ id: Users.id })

  if (!user) return null

  await db.insert(Connections).values({
    providerId,
    providerName,
    userId: user.id,
  })

  if (imageUrl) {
    // Implement image download and storage logic here
    // This might involve using a separate image storage service
  }

  const [session] = await db
    .insert(Sessions)
    .values({
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    })
    .returning()

  return session
}

export async function logout(
  {
    request,
    redirectTo = '/',
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const sessionId = authSession.get(sessionKey)
  if (sessionId) {
    await db.delete(Sessions).where(eq(Sessions.id, sessionId))
  }
  throw redirect(safeRedirect(redirectTo), {
    ...responseInit,
    headers: combineHeaders(
      { 'set-cookie': await authSessionStorage.destroySession(authSession) },
      responseInit?.headers,
    ),
  })
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10)
  return hash
}

export async function verifyUserPassword(
  where: { email: string } | { id: string },
  password: string,
) {
  const userWithPassword = await db.query.Users.findFirst({
    where:
      'email' in where ? eq(Users.email, where.email) : eq(Users.id, where.id),
    columns: { id: true },
    with: { password: { columns: { hash: true } } },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  return { id: userWithPassword.id }
}
