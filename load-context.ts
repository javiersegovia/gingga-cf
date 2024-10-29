import { drizzle } from 'drizzle-orm/postgres-js'
import type { PlatformProxy } from 'wrangler'
import * as schema from '@/db/schema'

interface Env {
  MY_VAR: string
}

type Cloudflare = Omit<PlatformProxy<Env>, 'dispose'>

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: Cloudflare
    db: Awaited<ReturnType<typeof drizzle<typeof schema>>>
  }
}
