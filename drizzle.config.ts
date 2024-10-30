import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({
  path: '.dev.vars',
})

export default defineConfig({
  out: './app/db/drizzle',
  schema: './app/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
