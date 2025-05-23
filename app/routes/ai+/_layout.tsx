import { Outlet, useLoaderData } from '@remix-run/react'
import { Sidebar } from '@/components/sidebar'
import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { ProjectService } from '@/.server/services/project-service'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, context)

  const { getProjects } = new ProjectService(context)
  const projects = await getProjects(userId)

  return json({ projects })
}

export default function AILayout() {
  const { projects } = useLoaderData<typeof loader>()

  return (
    <div className="flex h-screen bg-gray-900 text-white relative">
      <Sidebar projects={projects} />

      <main className="flex-1 overflow-auto z-10">
        <Outlet />
      </main>
    </div>
  )
}
