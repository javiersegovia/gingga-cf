import { cleanupDb } from './utils'
import { seedRolesAndPermissions } from './roles-and-permissions'
import { seedUsers } from './users'
import { seedGeneralModules } from './general-modules'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../schema'
import { createClient } from '@libsql/client/web'

if (!process.env.TURSO_DB_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error(
    'TURSO_DB_URL or TURSO_AUTH_TOKEN is not set. Update your .dev.vars file.',
  )
}

export const db = drizzle(
  createClient({
    url: process.env.TURSO_DB_URL.trim(),
    authToken: process.env.TURSO_AUTH_TOKEN.trim(),
  }),
  { schema },
)

async function seed() {
  console.info('🌱 Seeding...')
  console.time('🌱 Database has been seeded')

  console.time('🧹 Cleaned up the database...')
  await cleanupDb()
  console.timeEnd('🧹 Cleaned up the database...')

  await seedRolesAndPermissions()
  await seedUsers()
  await seedGeneralModules()

  console.timeEnd('🌱 Database has been seeded')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    db.$client.close()
  })
