/* eslint-disable no-console */
import { db } from '../db.server'
import { createUser } from './utils'
import { UserRoles, Roles } from '../schema'
import { eq } from 'drizzle-orm'
// import { MOCK_CODE_GITHUB } from '@/core/auth/providers/constants'
// import { insertGitHubUser } from '../../../tests/mocks/github'

export async function seedUsers() {
  console.time('👤 Created users...')

  const totalUsers = 5
  for (let i = 0; i < totalUsers; i++) {
    const user = await createUser()
    const userRole = await db.query.Roles.findFirst({
      where: eq(Roles.name, 'user'),
    })
    if (userRole) {
      await db
        .insert(UserRoles)
        .values({ userId: user.id, roleId: userRole.id })
    }
  }

  console.timeEnd('👤 Created users...')

  console.time('🐨 Created admin user "jon"')
  const adminUser = await createUser({
    email: 'test@admin.com',
    firstName: 'Test',
    lastName: 'Admin',
    password: '123123123',
  })
  const adminUser2 = await createUser({
    email: process.env.ADMIN_USER_EMAIL,
    password: process.env.ADMIN_USER_PASSWORD,
    firstName: 'Admin',
    lastName: 'Account',
  })

  const adminRole = await db.query.Roles.findFirst({
    where: eq(Roles.name, 'admin'),
  })

  if (adminRole) {
    await db.insert(UserRoles).values([
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: adminUser2.id, roleId: adminRole.id },
    ])
  }

  // const githubUser = await insertGitHubUser(MOCK_CODE_GITHUB)
  // await db.insert(Connections).values({
  //   providerId: githubUser.profile.id,
  //   providerName: 'github',
  //   userId: adminUser.id,
  // })

  console.timeEnd('🐨 Created admin user "jon"')
}
