import type { RequestHandler, AppLoadContext } from '@remix-run/cloudflare'
import { drizzle } from 'drizzle-orm/postgres-js'
import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { remix } from 'remix-hono/handler'
import * as schema from '@/db/schema'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string
    MY_VAR: string
  }
}>()

let handler: RequestHandler | undefined

app.use(poweredBy())
app.get('/hono', (c) => c.text('Hono, ' + c.env.MY_VAR))

app.use(async (c, next) => {
  if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
    const db = drizzle(c.env.DATABASE_URL, { schema })

    // @ts-expect-error it's not typed
    const serverBuild = await import('./build/server')
    return remix({
      build: serverBuild,
      mode: 'production',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      getLoadContext(c) {
        return {
          cloudflare: {
            env: c.env,
          },
          db,
        }
      },
    })(c, next)
  } else {
    if (!handler) {
      // @ts-expect-error it's not typed
      const build = await import('virtual:remix/server-build')
      const { createRequestHandler } = await import('@remix-run/cloudflare')
      handler = createRequestHandler(build, 'development')
    }

    const db = drizzle(c.env.DATABASE_URL, { schema })

    const remixContext = {
      cloudflare: {
        env: c.env,
      },
      db,
    } as unknown as AppLoadContext
    return handler(c.req.raw, remixContext)
  }
})

export default app
