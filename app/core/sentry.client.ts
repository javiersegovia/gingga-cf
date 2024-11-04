import { useEffect } from 'react'
import { useLocation, useMatches } from '@remix-run/react'
import { browserTracingIntegration, init as sentryInit } from '@sentry/remix'

export class SentryService {
  private static instance: SentryService
  private constructor(dsn: string, environment: string) {
    sentryInit({
      dsn,
      environment,
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
        // replayIntegration(),
        // browserProfilingIntegration(),
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

  static init({ dsn, environment }: { dsn: string; environment: string }) {
    if (!this.instance) {
      this.instance = new SentryService(dsn, environment)
    }
  }
}
