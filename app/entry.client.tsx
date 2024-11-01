import { startTransition, StrictMode, useEffect } from 'react'
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
import { hydrateRoot } from 'react-dom/client'
// import {
//   browserProfilingIntegration,
//   browserTracingIntegration,
//   replayIntegration,
//   init as sentryInit,
// } from '@sentry/remix'

// todo: execute Sentry conditionally only if the file path exist. We should delete it everytime after we run a command, so we can activate Sentry in development contidionally
// // We add a timeout to make sure the __remixContext is hydrated
// setTimeout(() => {
//   const sentry = window.__remixContext.state.loaderData?.root?.sentry

//   if (sentry?.mode === 'production' || import.meta.env.PROD) {

//   }
// // }, 10)
// console.log('from entry.client.tsx')

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>,
  )
})
