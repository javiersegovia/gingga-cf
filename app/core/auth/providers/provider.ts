import type { Strategy } from 'remix-auth'

// Define a user type for cleaner typing
export type ProviderUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
}

export interface AuthProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAuthStrategy(): Strategy<ProviderUser, any>
  handleMockAction(request: Request): Promise<void>
  resolveConnectionData(providerId: string): Promise<{
    displayName: string
    link?: string | null
  }>
}

export const normalizeEmail = (s: string) => s.toLowerCase()

export const normalizeUsername = (s: string) =>
  s.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
