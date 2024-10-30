import { OnboardingForm } from '@/components/forms/onboarding-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { sessionKey, signup } from '@/core/auth/auth.server'
import { AuthSessionStorage } from '@/core/auth/auth-session.server'
import {
  requireOnboardingEmail,
  VerifySessionStorage,
} from '@/core/auth/verification.server'
import { checkHoneypot } from '@/core/honeypot.server'
import { redirectWithToast } from '@/core/toast.server'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { json } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { requireAnonymous } from '@/core/auth/auth-utils.server'
import { FirstNameSchema, LastNameSchema } from '@/core/auth/auth-schema'
import { z } from 'zod'
import { useId } from 'react'
import { FormProvider, useForm } from '@conform-to/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'

export const OnboardingSchema = z.object({
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
  agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
    required_error: 'You must agree to the terms of service and privacy policy',
  }),
  remember: z.boolean().optional(),
  redirectTo: z.string().optional(),
})

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireAnonymous(request, context)
  const email = await requireOnboardingEmail(request, context)
  return json({ email })
}

export async function action({ request, context }: ActionFunctionArgs) {
  await requireAnonymous(request, context)

  const email = await requireOnboardingEmail(request, context)
  const formData = await request.formData()

  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      OnboardingSchema.transform(async (data) => {
        if (intent !== null) return { ...data, session: null }

        const session = await signup(context, { ...data, email })
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

  const authSessionStorage = AuthSessionStorage.get(context)
  const verifySessionStorage = VerifySessionStorage.get(context)

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
    context,
    safeRedirect(redirectTo || '/'),
    { title: 'Welcome', description: 'Thanks for signing up!' },
    { headers },
  )
}

export default function OnboardingRoute() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const fallbackId = useId()
  const [form] = useForm({
    id: fallbackId,
    constraint: getZodConstraint(OnboardingSchema),
    lastResult: actionData?.result || null,
    shouldRevalidate: 'onBlur',
    onValidate: (c) => parseWithZod(c.formData, { schema: OnboardingSchema }),
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <Card className="w-full max-w-lg border-gray-800 bg-gray-900 text-neutral-200">
        <CardHeader>
          <CardTitle className="text-center">
            Welcome aboard {data.email}!
          </CardTitle>

          <CardDescription className="text-center">
            Please enter your details to complete your account setup.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FormProvider context={form.context}>
            <Form id={form.id} method="post">
              <HoneypotInputs />
              <OnboardingForm />
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
