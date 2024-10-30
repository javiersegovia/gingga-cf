import { createId as cuid } from '@paralleldrive/cuid2'
import {
  AppLoadContext,
  createCookieSessionStorage,
  redirect,
  SessionData,
} from '@remix-run/cloudflare'
import { z } from 'zod'
import { combineHeaders } from './utils'

export const toastKey = 'toast'

const ToastSchema = z.object({
  description: z.string(),
  id: z.string().default(() => cuid()),
  title: z.string().optional(),
  toastType: z.enum(['message', 'success', 'error']).default('message'),
})

export type Toast = z.infer<typeof ToastSchema>
export type ToastInput = z.input<typeof ToastSchema>

export class ToastSessionStorage {
  private static instance: ToastSessionStorage
  private sessionStorage: ReturnType<
    typeof createCookieSessionStorage<SessionData, SessionData>
  >

  private constructor(private c: AppLoadContext) {
    this.sessionStorage = createCookieSessionStorage({
      cookie: {
        name: 'g_verification',
        sameSite: 'lax', // CSRF protection is advised if changing to 'none'
        path: '/',
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        secrets: [c.cloudflare.env.SESSION_SECRET],
        secure: c.cloudflare.env.NODE_ENV !== 'development',
      },
    })
  }

  static get(context: AppLoadContext) {
    if (!ToastSessionStorage.instance) {
      ToastSessionStorage.instance = new ToastSessionStorage(context)
    }
    return ToastSessionStorage.instance.sessionStorage
  }
}

export async function redirectWithToast(
  context: AppLoadContext,
  url: string,
  toast: ToastInput,
  init?: ResponseInit,
) {
  return redirect(url, {
    ...init,
    headers: combineHeaders(
      init?.headers,
      await createToastHeaders(context, toast),
    ),
  })
}

export async function createToastHeaders(
  context: AppLoadContext,
  toastInput: ToastInput,
) {
  const toastSessionStorage = ToastSessionStorage.get(context)
  const session = await toastSessionStorage.getSession()
  const toast = ToastSchema.parse(toastInput)
  session.flash(toastKey, toast)
  const cookie = await toastSessionStorage.commitSession(session)
  return new Headers({ 'set-cookie': cookie })
}

export async function getToast(request: Request, context: AppLoadContext) {
  const toastSessionStorage = ToastSessionStorage.get(context)
  const session = await toastSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const result = ToastSchema.safeParse(session.get(toastKey))
  const toast = result.success ? result.data : null
  return {
    toast,
    headers: toast
      ? new Headers({
          'set-cookie': await toastSessionStorage.destroySession(session),
        })
      : null,
  }
}
