import type { PermissionString } from '@/core/old_auth/user'

import { requireUserId } from '@/core/old_auth/auth.server'
import { parsePermissionString } from '@/core/old_auth/user'
import { Users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { AppLoadContext, json } from '@remix-run/cloudflare'

export async function requireUserWithPermission({
  request,
  context,
  permission,
}: {
  request: Request
  context: AppLoadContext
  permission: PermissionString
}) {
  const userId = await requireUserId(request, context)
  const permissionData = parsePermissionString(permission)

  const user = await context.db.query.Users.findFirst({
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

export async function requireUserWithRole({
  request,
  context,
  name,
}: {
  request: Request
  context: AppLoadContext
  name: string
}) {
  const userId = await requireUserId(request, context)
  const user = await context.db.query.Users.findFirst({
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
