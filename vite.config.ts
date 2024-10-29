import devServer, { defaultOptions } from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

declare module '@remix-run/cloudflare' {
  interface Future {
    v3_singleFetch: true
    v3_fetcherPersist: true
    v3_relativeSplatPath: true
    v3_throwAbortReason: true
    v3_lazyRouteDiscovery: true
  }
}

export default defineConfig({
  build: {
    minify: true,
  },
  ssr: {
    resolve: {
      externalConditions: ['workerd', 'worker'],
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    devServer({
      adapter,
      entry: 'server.ts',
      exclude: [...defaultOptions.exclude, '/assets/**', '/app/**'],
      injectClientScript: false,
    }),
  ],
})
