import { RegisterForm } from '@/components/forms/register-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppForm } from '@/components/ui/forms'
import { Logo } from '@/components/ui/logos'
import { requireAnonymous } from '@/core/auth/auth.server'
import { EmailSchema } from '@/core/auth/user-schema'
import { sendEmail } from '@/core/email/email.server'
import VerificationEmail from '@/core/email/templates/auth/verification-code'
import { checkHoneypot } from '@/core/honeypot.server'
import { db } from '@/db/db.server'
import { Users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { parseWithZod } from '@conform-to/zod'
import { json } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { Link, redirect, useActionData } from '@remix-run/react'
import { $path } from 'remix-routes'
import { z } from 'zod'
import { prepareVerification } from './verify/verify.server'
import { createToastHeaders } from '@/core/toast.server'

const RegisterSchema = z.object({
  email: EmailSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return json(null)
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)
  const formData = await request.formData()

  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: RegisterSchema.superRefine(async (data, ctx) => {
      const existingUser = await db
        .select()
        .from(Users)
        .where(eq(Users.email, data.email))
        .limit(1)

      if (existingUser.length > 0) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'A user already exists with this email',
        })
        return
      }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return json(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { email } = submission.value
  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: 'onboarding',
    target: email,
  })

  const response = await sendEmail({
    to: email,
    subject: 'Welcome to Gingga!',
    react: <VerificationEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
  })

  if (response.status === 'success') {
    return redirect(redirectTo.toString())
  }

  const headers = await createToastHeaders({
    title: 'Error',
    description: 'Failed to sign up. Please try again.',
    toastType: 'error',
  })

  return json(
    { result: submission.reply({ formErrors: [response.error.message] }) },
    { status: 500, headers },
  )
}

export default function Register() {
  const actionData = useActionData<typeof action>()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <Link to={$path('/')} className="mb-5">
        <Logo />
      </Link>

      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-200">
            Welcome to Gingga!
          </CardTitle>
          <div className="text-sm text-gray-400">
            Complete the details to continue
          </div>
        </CardHeader>

        <CardContent>
          <AppForm schema={RegisterSchema} lastResult={actionData?.result}>
            <RegisterForm />
          </AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
