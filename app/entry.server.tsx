/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { isbot } from 'isbot'
import { renderToReadableStream } from 'react-dom/server'
import { NonceProvider } from '@/core/nonce-provider'

// https://remix.run/docs/en/main/guides/single-fetch#streaming-timeout
const ABORT_DELAY = 6000

// Reject all pending promises from handler functions after 5 seconds
export const streamTimeout = 5000

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!

  loadContext: AppLoadContext,
) {
  const nonce = loadContext.nonce ?? ''

  let didError = false
  const newHeaders = new Headers(responseHeaders)

  const body = await renderToReadableStream(
    <NonceProvider value={nonce}>
      <RemixServer
        context={remixContext}
        url={request.url}
        abortDelay={ABORT_DELAY}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell

        didError = true
        console.error(error)
        responseStatusCode = 500
      },
    },
  )

  try {
    if (isbot(request.headers.get('user-agent') || '')) {
      await body.allReady
    }

    newHeaders.set('Content-Type', 'text/html')
    return new Response(body, {
      status: didError ? 500 : responseStatusCode,
      headers: newHeaders,
    })
  } catch (error) {
    console.error('Stream error:', error)
    newHeaders.set('Content-Type', 'text/html')
    return new Response('Internal Server Error', {
      status: 500,
      headers: newHeaders,
    })
  }
}
