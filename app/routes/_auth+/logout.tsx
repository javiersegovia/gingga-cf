import { logout } from '@/core/auth/auth.server'
import { redirect } from '@remix-run/cloudflare'
import type { ActionFunctionArgs } from '@remix-run/cloudflare'

export async function loader() {
  return redirect('/')
}

export async function action({ request, context }: ActionFunctionArgs) {
  return await logout(request, context)
}
