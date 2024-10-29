import { OnboardingForm } from '@/components/forms/onboarding-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AppForm } from '@/components/ui/forms'
import { sessionKey, signup } from '@/core/auth/auth.server'
import { authSessionStorage } from '@/core/auth/session.server'
import { verifySessionStorage } from '@/core/auth/verification.server'
import { checkHoneypot } from '@/core/honeypot.server'
import { redirectWithToast } from '@/core/toast.server'
import { parseWithZod } from '@conform-to/zod'
import { json } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { useActionData, useLoaderData } from '@remix-run/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { OnboardingSchema } from './onboarding.schema'
import { requireOnboardingEmail } from './onboarding.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const email = await requireOnboardingEmail(request)
  return json({ email })
}

export async function action({ request }: ActionFunctionArgs) {
  const email = await requireOnboardingEmail(request)
  const formData = await request.formData()
  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      OnboardingSchema.transform(async (data) => {
        if (intent !== null) return { ...data, session: null }

        const session = await signup({ ...data, email })
        return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { session, remember, redirectTo } = submission.value

  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  authSession.set(sessionKey, session.id)
  const verifySession = await verifySessionStorage.getSession()
  const headers = new Headers()
  headers.append(
    'set-cookie',
    await authSessionStorage.commitSession(authSession, {
      expires: remember ? session.expirationDate : undefined,
    }),
  )
  headers.append(
    'set-cookie',
    await verifySessionStorage.destroySession(verifySession),
  )

  return redirectWithToast(
    safeRedirect(redirectTo || '/'),
    { title: 'Welcome', description: 'Thanks for signing up!' },
    { headers },
  )
}

export default function OnboardingRoute() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">
            Welcome aboard {data.email}!
          </CardTitle>

          <CardDescription className="text-center">
            Please enter your details to complete your account setup.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AppForm
            schema={OnboardingSchema}
            method="post"
            lastResult={actionData?.result}
          >
            <OnboardingForm />
          </AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
