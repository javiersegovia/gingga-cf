import { getDbSetup } from '@/db/setup'
import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.dev.vars' })

const { url, authToken, dialect } = getDbSetup(process.env as unknown as Env)

export default defineConfig({
  out: './app/db/drizzle',
  schema: './app/db/schema.ts',

  dialect,

  ...(dialect === 'turso'
    ? {
        dbCredentials: {
          url,
          authToken,
        },
      }
    : {
        dbCredentials: {
          url,
        },
      }),

  migrations: {
    prefix: 'timestamp',
  },
})
