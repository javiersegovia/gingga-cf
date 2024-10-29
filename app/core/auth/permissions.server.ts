import type { PermissionString } from '@/core/auth/user'

import { requireUserId } from '@/core/auth/auth.server'
import { parsePermissionString } from '@/core/auth/user'
import { db } from '@/db/db.server'
import { Users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { json } from '@remix-run/cloudflare'

export async function requireUserWithPermission(
  request: Request,
  permission: PermissionString,
) {
  const userId = await requireUserId(request)
  const permissionData = parsePermissionString(permission)

  const user = await db.query.Users.findFirst({
    where: eq(Users.id, userId),
    with: {
      roles: {
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: {
                    columns: {
                      action: true,
                      entity: true,
                      access: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (
    !user ||
    !user.roles.some((role) =>
      role.role.rolePermissions.some(
        (rp) =>
          rp.permission.action === permissionData.action &&
          rp.permission.entity === permissionData.entity &&
          (!permissionData.access ||
            rp.permission.access === permissionData.access),
      ),
    )
  ) {
    throw json(
      {
        error: 'Unauthorized',
        requiredPermission: permissionData,
        message: `Required permissions: ${permission}`,
      },
      { status: 403 },
    )
  }
  return user.id
}

export async function requireUserWithRole(request: Request, name: string) {
  const userId = await requireUserId(request)
  const user = await db.query.Users.findFirst({
    where: eq(Users.id, userId),
    with: {
      roles: {
        with: {
          role: true,
        },
      },
    },
  })

  if (!user || !user.roles.some((role) => role.role.name === name)) {
    throw json(
      {
        error: 'Unauthorized',
        requiredRole: name,
        message: `Required role: ${name}`,
      },
      { status: 403 },
    )
  }
  return user.id
}
