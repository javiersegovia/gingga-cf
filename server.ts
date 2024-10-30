import type { RequestHandler } from '@remix-run/cloudflare'
import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { remix } from 'remix-hono/handler'

import { getLoadContext } from './load-context'
import type { ContextEnv } from './load-context'

import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'

const app = new Hono<ContextEnv>()

let handler: RequestHandler | undefined

app.use(poweredBy())
app.get('/hono', (c) => c.text('Hono, ' + c.env.MY_VAR))

let dbClient: ReturnType<typeof drizzle<typeof schema>> | undefined

app.use(async (c, next) => {
  if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
    const db = drizzle(c.env.DATABASE_URL, { schema })

    // @ts-ignore
    const serverBuild = await import('./build/server')
    return remix({
      build: serverBuild,
      mode: 'production',
      // @ts-ignore
      getLoadContext(c) {
        return { ...getLoadContext(c), db }
      },
    })(c, next)
  } else {
    if (!handler) {
      // @ts-expect-error it's not typed
      const build = await import('virtual:remix/server-build')
      const { createRequestHandler } = await import('@remix-run/cloudflare')
      handler = createRequestHandler(build, 'development')
    }

    if (!dbClient) {
      dbClient = drizzle(c.env.DATABASE_URL, { schema })
    }

    const remixContext = {
      ...getLoadContext(c),
      db: dbClient,
    }
    return handler(c.req.raw, remixContext)
  }
})

export default app
