import { db } from '../db.server'
import { cleanupDb } from './utils'
import { seedRolesAndPermissions } from './roles-and-permissions'
import { seedUsers } from './users'
import { seedGeneralModules } from './general-modules'

async function seed() {
  console.log('🌱 Seeding...')
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
