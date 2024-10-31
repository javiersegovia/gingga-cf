import type { RequestHandler } from '@remix-run/cloudflare'
import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import { remix } from 'remix-hono/handler'
import { staticAssets } from 'remix-hono/cloudflare'
// import crypto from 'node:crypto'

import { secureHeaders, NONCE } from 'hono/secure-headers'
import { getLoadContext } from './load-context'
import type { ContextEnv } from './load-context'

import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'

const app = new Hono<ContextEnv>()

let handler: RequestHandler | undefined

// app.use(poweredBy())

// let dbClient: ReturnType<typeof drizzle<typeof schema>> | undefined
// if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
//   app.use('*', staticAssets())
// }

// app.use(async (c, next) => {
//   c.set('cspNonce', crypto.randomBytes(16).toString('hex'))
//   await next()
// })

app.use(
  '*',
  secureHeaders({
    referrerPolicy: 'same-origin',
    removePoweredBy: true,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicyReportOnly: {
      connectSrc: [
        process.env.NODE_ENV === 'development' ? 'ws:' : null,
        // process.env.SENTRY_DSN ? '*.sentry.io' : undefined,
        "'self'",
      ].filter(Boolean) as string[],
      fontSrc: ["'self'"],
      frameSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      scriptSrcAttr: [NONCE],
      scriptSrc: ["'strict-dynamic'", "'self'", NONCE],
    },
  }),
)

app.use(async (c, next) => {
  const db = drizzle(c.env.DATABASE_URL, { schema })

  if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
    // @ts-ignore
    const serverBuild = await import('./build/server')
    return remix({
      // @ts-ignore
      build: serverBuild,
      mode: 'production',
      getLoadContext(c) {
        return {
          ...getLoadContext(c),
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

    // if (!dbClient) {
    //   dbClient = drizzle(c.env.DATABASE_URL, { schema })
    // }

    const remixContext = {
      ...getLoadContext(c),
      db,
    }
    return handler(c.req.raw, remixContext)
  }
})

export default app
