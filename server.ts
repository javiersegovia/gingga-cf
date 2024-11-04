/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { RequestHandler } from '@remix-run/cloudflare'
import { Hono } from 'hono'
import { sentry } from '@hono/sentry'
import { secureHeaders, NONCE } from 'hono/secure-headers'
import { remix } from 'remix-hono/handler'
import { Client, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/db/schema'
import { config } from 'dotenv'
import { getLoadContext } from './load-context'
import type { ContextEnv } from './load-context'

neonConfig.webSocketConstructor = ws

const app = new Hono<ContextEnv>()
let handler: RequestHandler | undefined

config({ path: '.dev.vars' })

app.use('*', async (c, next) => {
  return secureHeaders({
    referrerPolicy: 'same-origin',
    removePoweredBy: true,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicyReportOnly: {
      connectSrc: [
        c.env.NODE_ENV === 'development' ? 'ws:' : null,
        '*.sentry.io',
        "'self'",
      ].filter(Boolean) as string[],
      fontSrc: ["'self'"],
      frameSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      scriptSrcAttr: [NONCE],
      scriptSrc: ["'strict-dynamic'", "'self'", NONCE],
    },
  })(c, next)
})

app.use('*', async (c, next) => {
  return sentry({
    dsn: c.env.SENTRY_DSN,
    dist: 'server',
    tracesSampleRate: 1,
    denyUrls: ['/resources/healthcheck', '/assets/*'],
    tracesSampler(samplingContext) {
      // ignore healthcheck transactions by other services (consul, etc.)
      if (samplingContext.request?.url?.includes('/resources/healthcheck')) {
        return 0
      }
      return 1
    },
    beforeSendTransaction(event) {
      // ignore all healthcheck related transactions
      //  note that name of header here is case-sensitive
      const isHealthcheck = event.request?.headers?.['x-healthcheck'] === 'true'
      return isHealthcheck ? null : event
    },
  })(c, next)
})

// TODO - Implement a proper healthcheck
// - check if we can connect to the database
app.get('/resources/healthcheck', (c) => {
  return c.text('ok')
})

// TODO - Implement Rate limiting
// https://github.com/rhinobase/hono-rate-limiter

app.use('*', async (c, next) => {
  const client = new Client(c.env.DATABASE_URL)
  await client.connect()
  const db = drizzle(client, { schema })

  // TODO - Close db connections

  c.set('db', db)
  await next()
})

app.use(async (c, next) => {
  const db = c.get('db')

  if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
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

    const remixContext = {
      ...getLoadContext(c),
      db,
    }
    return handler(c.req.raw, remixContext)
  }
})

export default app
