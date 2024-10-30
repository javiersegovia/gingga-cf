import { Outlet } from '@remix-run/react'
import { Sidebar } from '@/components/sidebar'
import type { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { requireUserId } from '@/core/auth/auth-utils.server'
import { FlickeringGrid } from '@/components/ui/flickering-grid'
import { Projects } from '@/db/schema'

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request, context)
  return json({ projects: [] as (typeof Projects.$inferSelect)[] })
}

export default function AILayout() {
  const { projects } = useLoaderData<typeof loader>()

  return (
    <div className="flex h-screen bg-gray-900 text-white relative">
      <FlickeringGrid />

      <Sidebar projects={projects} />
      <main className="flex-1 overflow-auto z-10">
        <Outlet />
      </main>
    </div>
  )
}
