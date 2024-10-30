import {
  AppLoadContext,
  createCookieSessionStorage,
  SessionData,
} from '@remix-run/cloudflare'

export class AuthSessionStorage {
  private static instance: AuthSessionStorage
  private sessionStorage: ReturnType<
    typeof createCookieSessionStorage<SessionData, SessionData>
  >

  private constructor(private c: AppLoadContext) {
    const sessionStorage = createCookieSessionStorage({
      cookie: {
        name: 'g_session',
        sameSite: 'lax', // CSRF protection is advised if changing to 'none'
        path: '/',
        httpOnly: true,
        secrets: [c.cloudflare.env.SESSION_SECRET],
        secure: c.cloudflare.env.NODE_ENV !== 'development',
      },
    })

    // we have to do this because every time you commit the session you overwrite it
    // so we store the expiration time in the cookie and reset it every time we commit
    const originalCommitSession = sessionStorage.commitSession

    Object.defineProperty(sessionStorage, 'commitSession', {
      value: async function commitSession(
        ...args: Parameters<typeof originalCommitSession>
      ) {
        const [session, options] = args
        if (options?.expires) {
          session.set('expires', options.expires)
        }
        if (options?.maxAge) {
          session.set('expires', new Date(Date.now() + options.maxAge * 1000))
        }
        const expires = session.has('expires')
          ? new Date(session.get('expires'))
          : undefined
        const setCookieHeader = await originalCommitSession(session, {
          ...options,
          expires,
        })
        return setCookieHeader
      },
    })

    this.sessionStorage = sessionStorage
  }

  static get(context: AppLoadContext) {
    if (!AuthSessionStorage.instance) {
      AuthSessionStorage.instance = new AuthSessionStorage(context)
    }
    return AuthSessionStorage.instance.sessionStorage
  }
}
