import { config } from 'dotenv'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

config({ path: '.dev.vars' })

const db = drizzle(
  postgres(`${process.env.DIRECT_DB_URL}`, { ssl: 'require', max: 1 }),
)

const main = async () => {
  try {
    await migrate(db, { migrationsFolder: './app/db/drizzle' })
    console.info('Migration complete')
  } catch (error) {
    console.error(error)
  }
  process.exit(0)
}
main()
