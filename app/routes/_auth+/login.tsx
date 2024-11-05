import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/cloudflare'
import { Form, Link, useActionData } from '@remix-run/react'
import { AuthService } from '@/core/auth/auth-service.server'
import { LoginSchema } from '@/core/auth/auth-schema'
import { requireAnonymous } from '@/core/auth/auth-utils.server'
import { createToastHeaders } from '@/core/toast.server'
import { Logo } from '@/components/ui/logos'
import { $path } from 'remix-routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/forms/login-form'
import { useId } from 'react'
import { FormProvider, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { HoneypotInputs } from 'remix-utils/honeypot/react'

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireAnonymous(request, context)
  return null
}

export async function action({ request, context }: ActionFunctionArgs) {
  await requireAnonymous(request, context)
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: LoginSchema })

  if (submission.status !== 'success' || !submission.value.email) {
    return data(
      { result: submission.reply({ hideFields: ['password'] }) },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { requestMagicLink } = new AuthService(request, context)

  const { redirectTo, error } = await requestMagicLink(submission.value.email)

  if (redirectTo) {
    return redirect(redirectTo.toString())
  }

  const headers = await createToastHeaders(context, {
    title: 'Error',
    description: error.message,
    toastType: 'error',
  })

  return data({ result: submission.reply() }, { headers })
}

export default function Route() {
  const actionData = useActionData<typeof action>()

  const fallbackId = useId()
  const [form] = useForm({
    id: fallbackId,
    constraint: getZodConstraint(LoginSchema),
    lastResult: actionData?.result || null,
    shouldRevalidate: 'onBlur',
    onValidate: (c) => parseWithZod(c.formData, { schema: LoginSchema }),
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <Link to={$path('/')} className="mb-5">
        <Logo />
      </Link>

      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-200">
            Login
          </CardTitle>
          <p className="text-sm text-gray-400">
            Welcome! We&apos;ll send you a link to log in.
          </p>
        </CardHeader>

        <CardContent className="text-gray-300">
          <FormProvider context={form.context}>
            <Form id={form.id} method="post">
              <HoneypotInputs />
              <LoginForm />
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
