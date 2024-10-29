/* eslint-disable no-console */
import { db } from '../db.server'
import { Permissions, Roles, RolePermissions } from '../schema'
import { eq } from 'drizzle-orm'

export async function seedRolesAndPermissions() {
  console.time('🔑 Created permissions...')
  const entities = ['user']
  const actions = ['create', 'read', 'update', 'delete']
  const accesses = ['own', 'any'] as const

  const permissionsToCreate = []
  for (const entity of entities) {
    for (const action of actions) {
      for (const access of accesses) {
        permissionsToCreate.push({
          entity,
          action,
          access,
          description: `${action} ${access} ${entity} permission`,
        })
      }
    }
  }
  await db.insert(Permissions).values(permissionsToCreate)
  console.timeEnd('🔑 Created permissions...')

  console.time('👑 Created roles...')
  const [adminRole] = await db
    .insert(Roles)
    .values({ name: 'admin', description: 'Admin role' })
    .returning()

  const [userRole] = await db
    .insert(Roles)
    .values({ name: 'user', description: 'User role' })
    .returning()

  if (!adminRole || !userRole) {
    throw new Error('Failed to create roles')
  }

  const adminPermissions = await db
    .select()
    .from(Permissions)
    .where(eq(Permissions.access, 'any'))
  const userPermissions = await db
    .select()
    .from(Permissions)
    .where(eq(Permissions.access, 'own'))

  await db.insert(RolePermissions).values(
    adminPermissions.map((permission) => ({
      roleId: adminRole.id,
      permissionId: permission.id,
    })),
  )

  await db.insert(RolePermissions).values(
    userPermissions.map((permission) => ({
      roleId: userRole.id,
      permissionId: permission.id,
    })),
  )

  console.timeEnd('👑 Created roles...')
}
