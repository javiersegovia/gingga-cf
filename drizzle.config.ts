import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.dev.vars' })

if (!process.env.DIRECT_DB_URL) {
  throw new Error('DIRECT_DB_URL is not set')
}

export default defineConfig({
  out: './app/db/drizzle',
  schema: './app/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_DB_URL,
  },
})
