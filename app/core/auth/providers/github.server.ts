import { createId as cuid } from '@paralleldrive/cuid2'
import { redirect } from '@remix-run/cloudflare'
import { GitHubStrategy } from 'remix-auth-github'
import { z } from 'zod'

import { connectionSessionStorage } from '../connections.server'

import { MOCK_CODE_GITHUB, MOCK_CODE_GITHUB_HEADER } from './constants'
import type { AuthProvider } from './provider'

const GitHubUserSchema = z.object({ login: z.string() })

const shouldMock =
  process.env.GITHUB_CLIENT_ID?.startsWith('MOCK_') ||
  process.env.NODE_ENV === 'test'

export class GitHubProvider implements AuthProvider {
  getAuthStrategy() {
    return new GitHubStrategy(
      {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectURI: '/auth/github/callback',
      },
      async ({ profile }) => {
        const email = profile.emails[0]?.value.trim().toLowerCase()
        if (!email) {
          throw new Error('Email not found')
        }
        const username = profile.displayName
        const imageUrl = profile?.photos[0]?.value

        return {
          email,
          id: profile.id,
          firstName: username, // TO DO: Check if we can get the name from GitHub!
          name: profile.name.givenName,
          imageUrl,
        }
      },
    )
  }

  async resolveConnectionData(providerId: string) {
    try {
      const response = await fetch(
        `https://api.github.com/user/${providerId}`,
        {
          headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
        },
      )
      const rawJson = await response.json()
      const result = GitHubUserSchema.safeParse(rawJson)

      if (result.success) {
        return {
          displayName: result.data.login,
          link: `https://github.com/${result.data.login}`,
        } as const
      }
      return {
        displayName: 'Unknown',
        link: null,
      } as const
    } catch (error) {
      console.error('Error fetching GitHub user data:', error)
      return {
        displayName: 'Unknown',
        link: null,
      } as const
    }
  }

  async handleMockAction(request: Request) {
    if (!shouldMock) return

    const connectionSession = await connectionSessionStorage.getSession(
      request.headers.get('cookie'),
    )
    const state = cuid()
    connectionSession.set('oauth2:state', state)

    // allows us to inject a code when running e2e tests,
    // but falls back to a pre-defined 🐨 constant
    const code =
      request.headers.get(MOCK_CODE_GITHUB_HEADER) || MOCK_CODE_GITHUB
    const searchParams = new URLSearchParams({ code, state })
    throw redirect(`/auth/github/callback?${searchParams}`, {
      headers: {
        'set-cookie':
          await connectionSessionStorage.commitSession(connectionSession),
      },
    })
  }
}
