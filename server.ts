/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { RequestHandler } from '@remix-run/cloudflare'
import { Hono } from 'hono'
import { sentry } from '@hono/sentry'
import { secureHeaders, NONCE } from 'hono/secure-headers'
import { remix } from 'remix-hono/handler'
import { Client, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/db/schema'
import { config } from 'dotenv'
import { getLoadContext } from './load-context'
import type { ContextEnv } from './load-context'
import ws from 'ws'

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
    environment: c.env.NODE_ENV,
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

// TODO - Implement a proper healthcheck with db connection and alerts
app.get('/resources/healthcheck', (c) => {
  return c.text('ok')
})

// TODO - Implement Rate limiting
// https://github.com/rhinobase/hono-rate-limiter

app.use('*', async (c, next) => {
  /**
   * This is needed for the dev environment.
   * In production, WebSockets are supported by the Worker
   */
  if (typeof WebSocket === 'undefined') {
    neonConfig.webSocketConstructor = ws
  }

  const client = new Client(c.env.DATABASE_URL)

  await client.connect()
  const db = drizzle(client, { schema })

  const remixContext = {
    ...getLoadContext(c),
    db,
  }

  try {
    if (process.env.NODE_ENV !== 'development' || import.meta.env.PROD) {
      // @ts-ignore
      const serverBuild = await import('./build/server')
      const remixHandler = remix({
        // @ts-ignore
        build: serverBuild,
        mode: 'production',
        getLoadContext: () => remixContext,
      })

      const response = await remixHandler(c, next)
      c.executionCtx.waitUntil(client.end())
      return response
    } else {
      if (!handler) {
        // @ts-expect-error it's not typed
        const build = await import('virtual:remix/server-build')
        const { createRequestHandler } = await import('@remix-run/cloudflare')
        handler = createRequestHandler(build, 'development')
      }

      const response = await handler(c.req.raw, remixContext)
      c.executionCtx.waitUntil(client.end())
      return response
    }
  } catch (error: unknown) {
    console.error(error)
    return c.text('Error in server.ts')
  }
})

export default app
