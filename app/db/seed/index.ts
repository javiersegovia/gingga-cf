/* eslint-disable no-console */
import { cleanupDb } from './utils'
import { seedRolesAndPermissions } from './roles-and-permissions'
import { seedUsers } from './users'
import { seedGeneralModules } from './general-modules'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../schema'

export const db = drizzle(process.env.DATABASE_URL!, { schema })

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
    await db.$client.end()
  })
