import { Users, Passwords } from '../schema'
import { eq, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'
import { db } from '.'

export async function cleanupDb() {
  const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `

  const tables = (await db.run(query)).rows

  await db.transaction(async (tx) => {
    await Promise.all(
      tables.map((table) =>
        tx.run(sql.raw(`TRUNCATE TABLE ${table.table_name} CASCADE;`)),
      ),
    )
  })
}

export function createPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function createUser(userData?: {
  email?: string
  firstName?: string
  lastName?: string
  password?: string
}) {
  const email = userData?.email ?? faker.internet.email()
  const firstName = userData?.firstName ?? faker.person.firstName()
  const lastName = userData?.lastName ?? faker.person.lastName()
  const password = userData?.password ?? faker.internet.password()
  const hashedPassword = await createPassword(password)

  const [user] = await db
    .insert(Users)
    .values({
      email,
      firstName,
      lastName,
    })
    .returning()

  if (!user) {
    throw new Error('User not created')
  }

  await db.insert(Passwords).values({
    hash: hashedPassword,
    userId: user.id,
  })

  return user
}

export async function getUserByEmail(email: string) {
  return db.query.Users.findFirst({
    where: eq(Users.email, email),
  })
}
