import { captureRemixErrorBoundaryError, withSentry } from '@sentry/remix'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'

import {
  json,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare'

import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { combineHeaders, getDomainUrl } from './core/utils'
import { getTheme, Theme } from './core/theme.server'
import { getToast } from './core/toast.server'
import { honeypot } from './core/honeypot.server'
import { logout } from './core/auth/auth.server'
import { getUserId } from './core/auth/auth-utils.server'
import { Users } from './db/schema'
import { eq } from 'drizzle-orm'
import { useNonce } from './core/nonce-provider'
import { useToast } from './hooks/use-toast'
import { useEffect, useState } from 'react'
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useDehydratedState } from 'use-dehydrated-state'
import { getHints } from './core/client-hints'
import { ProgressBar } from './components/ui/progress-bar'
import { Toaster } from './components/ui/toaster'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { GeneralErrorBoundary } from './components/error-boundary'

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: tailwindStyleSheetUrl,
    },
  ].filter(Boolean)
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Gingga',
    },
    {
      name: 'description',
      content: 'Software agency focused on AI-powered solutions',
    },
  ]
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await getUserId(request, context)

  const user = userId
    ? await context.db.query.Users.findFirst({
        where: eq(Users.id, userId),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        with: {
          roles: {
            columns: {},
            with: {
              role: {
                columns: {
                  id: true,
                  name: true,
                },
                with: {
                  rolePermissions: {
                    columns: {},
                    with: {
                      permission: {
                        columns: {
                          id: true,
                          action: true,
                          entity: true,
                          access: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }).then((user) =>
        user
          ? {
              ...user,
              roles: user.roles.map((ur) => ur.role),
            }
          : null,
      )
    : null

  if (userId && !user) {
    // something weird happened... The user is authenticated but we can't find
    // them in the database. Maybe they were deleted? Let's log them out.
    console.info('Something weird happened')
    await logout(request, context, '/')
  }

  const { toast, headers: toastHeaders } = await getToast(request, context)
  const honeyProps = honeypot.getInputProps()

  return json(
    {
      user,
      allowIndexing: context.cloudflare.env.ALLOW_INDEXING,
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: {
          theme: getTheme(request),
        },
      },
      sentry: {
        dsn: context.cloudflare.env.SENTRY_DSN,
        mode: context.cloudflare.env.NODE_ENV,
      },
      toast,
      honeyProps,
    },
    {
      headers: combineHeaders(toastHeaders),
    },
  )
}

function Document({
  children,
  nonce,
  theme = 'dark',
  allowIndexing = true,
}: {
  children: React.ReactNode
  nonce: string
  theme?: Theme
  env?: Record<string, string>
  allowIndexing?: boolean
}) {
  return (
    <html lang="en" className={`${theme} h-full overflow-x-hidden`}>
      <head>
        <Meta />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {allowIndexing ? null : (
          <meta name="robots" content="noindex, nofollow" />
        )}
        <Links />
      </head>

      <body className="min-h-screen bg-background text-foreground flex flex-col">
        {children}

        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}

function App() {
  const { toast: loaderToast, allowIndexing } = useLoaderData<typeof loader>()
  const nonce = useNonce()
  const { toast } = useToast()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  )
  const dehydratedState = useDehydratedState()

  useEffect(() => {
    if (loaderToast) {
      toast(loaderToast)
    }
  }, [loaderToast, toast])

  return (
    <Document nonce={nonce} allowIndexing={Boolean(allowIndexing)}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <Outlet />
          <Toaster />
          <ProgressBar />
        </HydrationBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Document>
  )
}

function AppWithProviders() {
  const data = useLoaderData<typeof loader>()

  return (
    <HoneypotProvider {...data.honeyProps}>
      <App />
    </HoneypotProvider>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()
  captureRemixErrorBoundaryError(error)
  return <GeneralErrorBoundary />
}

export default withSentry(AppWithProviders)
