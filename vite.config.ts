import { sentryVitePlugin } from '@sentry/vite-plugin'
import devServer, { defaultOptions } from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { flatRoutes } from 'remix-flat-routes'
import { config } from 'dotenv'

declare module '@remix-run/cloudflare' {
  interface Future {
    v3_singleFetch: true
    v3_fetcherPersist: true
    v3_relativeSplatPath: true
    v3_throwAbortReason: true
    v3_lazyRouteDiscovery: true
  }
}

config({ path: '.dev.vars' })

export default defineConfig({
  build: {
    minify: true,
    cssMinify: process.env.NODE_ENV === 'production',
    sourcemap: true,
  },
  ssr: {
    resolve: {
      externalConditions: ['workerd', 'worker'],
    },
  },
  server: {
    port: 3000,
  },
  plugins: [
    remixCloudflareDevProxy(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },

      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes, {
          ignoredRouteFiles: [
            '.*',
            '**/*.css',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__*.*',
            // This is for server-side utilities you want to colocate
            // next to your routes without making an additional
            // directory. If you need a route that includes "server",
            // "client" or "schema" in the filename, use the escape brackets like:
            // my-route.[server].tsx or my-route.[schema].ts
            '**/*.schema.*',
            '**/*.server.*',
            '**/*.client.*',
          ],
        })
      },
    }),
    tsconfigPaths(),
    devServer({
      adapter,
      entry: 'worker/server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/app/**'],
      injectClientScript: false,
    }),

    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          disable: process.env.NODE_ENV !== 'production',
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          release: {
            name: process.env.COMMIT_SHA,
            setCommits: {
              auto: true,
            },
          },
        })
      : null,
  ],
})
