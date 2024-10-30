/* eslint-disable no-console */
import { cleanupDb } from './utils'
import { seedRolesAndPermissions } from './roles-and-permissions'
import { seedUsers } from './users'
import { seedGeneralModules } from './general-modules'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../schema'

const db = drizzle(process.env.DATABASE_URL!, { schema })

async function seed() {
  console.log('🌱 Seeding...')
  console.time('🌱 Database has been seeded')

  console.time('🧹 Cleaned up the database...')
  await cleanupDb(db)
  console.timeEnd('🧹 Cleaned up the database...')

  await seedRolesAndPermissions(db)
  await seedUsers(db)
  await seedGeneralModules(db)

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
