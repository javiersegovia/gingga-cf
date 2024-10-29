import { GeneralErrorBoundary } from '@/components/error-boundary'
import { ResetPasswordForm } from '@/components/forms/reset-password-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppForm } from '@/components/ui/forms'
import { Logo } from '@/components/ui/logos'
import { resetUserPassword } from '@/core/auth/auth.server'
import { PasswordAndConfirmPasswordSchema } from '@/core/auth/user-schema'
import { verifySessionStorage } from '@/core/auth/verification.server'
import { redirectWithToast } from '@/core/toast.server'
import { parseWithZod } from '@conform-to/zod'
import { json } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/cloudflare'
import { Link, useActionData, useLoaderData } from '@remix-run/react'
import { $path } from 'remix-routes'
import { requireResetPasswordEmail } from './reset-password.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Reset Password' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const resetPasswordEmail = await requireResetPasswordEmail(request)
  return json({ resetPasswordEmail })
}

export async function action({ request }: ActionFunctionArgs) {
  const resetPasswordEmail = await requireResetPasswordEmail(request)
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: PasswordAndConfirmPasswordSchema,
  })
  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { password } = submission.value
  await resetUserPassword({ email: resetPasswordEmail, password })
  const verifySession = await verifySessionStorage.getSession()

  return redirectWithToast(
    '/login',
    {
      title: 'Password reset successfully',
      description:
        'Your password has been successfully reset. You can now log in with your new password.',
      toastType: 'success',
    },
    {
      headers: {
        'set-cookie': await verifySessionStorage.destroySession(verifySession),
      },
    },
  )
}

export default function ResetPasswordPage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <Link to={$path('/')} className="mb-5">
        <Logo />
      </Link>

      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-200">
            New password
          </CardTitle>
          <p className="text-sm text-gray-400">
            Hi,{' '}
            <span className="font-medium text-gray-300">
              {data.resetPasswordEmail}
            </span>
            <br />
            No worries. It happens all the time.
          </p>
        </CardHeader>

        <CardContent className="text-gray-300">
          <AppForm
            formId="reset-password"
            schema={PasswordAndConfirmPasswordSchema}
            lastResult={actionData?.result}
          >
            <ResetPasswordForm />
          </AppForm>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
