import {
  AppLoadContext,
  createCookieSessionStorage,
  SessionData,
} from '@remix-run/cloudflare'
// import type { ProviderName } from './connections'
// import { GitHubProvider } from './providers/github.server'
// import type { AuthProvider } from './providers/provider'

export class ConnectionSessionStorage {
  private static instance: ConnectionSessionStorage
  private sessionStorage: ReturnType<
    typeof createCookieSessionStorage<SessionData, SessionData>
  >

  private constructor(private c: AppLoadContext) {
    this.sessionStorage = createCookieSessionStorage({
      cookie: {
        name: 'g_connection',
        sameSite: 'lax', // CSRF protection is advised if changing to 'none'
        path: '/',
        httpOnly: true,
        secrets: [c.cloudflare.env.SESSION_SECRET],
        secure: c.cloudflare.env.NODE_ENV === 'production',
      },
    })
  }

  static get(context: AppLoadContext) {
    if (!ConnectionSessionStorage.instance) {
      ConnectionSessionStorage.instance = new ConnectionSessionStorage(context)
    }
    return ConnectionSessionStorage.instance.sessionStorage
  }
}

// export const providers: Record<ProviderName, AuthProvider> = {
//   // github: new GitHubProvider(), // todo: add github provider
// }

// export function handleMockAction(
//   providerName: ProviderName,
//   request: Request,
//   context: AppLoadContext,
// ) {
//   return providers[providerName].handleMockAction(request, context)
// }

// export function resolveConnectionData(
//   providerName: ProviderName,
//   providerId: string,
// ) {
//   return providers[providerName].resolveConnectionData(providerId)
// }
