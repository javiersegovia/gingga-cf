import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.dev.vars' })

if (!process.env.TURSO_DB_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    'TURSO_DB_URL or TURSO_AUTH_TOKEN is not set. Update your .dev.vars file.',
  )
}

export default defineConfig({
  out: './app/db/drizzle',
  schema: './app/db/schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
})
