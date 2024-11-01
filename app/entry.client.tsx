import { startTransition, StrictMode, useEffect } from 'react'
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
import { hydrateRoot } from 'react-dom/client'
import {
  browserProfilingIntegration,
  browserTracingIntegration,
  replayIntegration,
  init as sentryInit,
} from '@sentry/remix'

// We add a timeout to make sure the __remixContext is hydrated
setTimeout(() => {
  const sentry = window.__remixContext.state.loaderData?.root?.sentry

  if (sentry?.mode === 'production' || import.meta.env.PROD) {
    sentryInit({
      dsn: sentry.dsn,
      environment: 'production',
      beforeSend(event) {
        if (event.request?.url) {
          const url = new URL(event.request.url)
          if (
            url.protocol === 'chrome-extension:' ||
            url.protocol === 'moz-extension:'
          ) {
            // This error is from a browser extension, ignore it
            return null
          }
        }
        return event
      },
      integrations: [
        browserTracingIntegration({
          useEffect,
          useLocation,
          useMatches,
        }),
        replayIntegration(),
        browserProfilingIntegration(),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })
  }
}, 10)

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  )
})
