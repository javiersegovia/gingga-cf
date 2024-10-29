import { GeneralErrorBoundary } from '@/components/error-boundary'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppForm } from '@/components/ui/forms'
import { EmailSchema } from '@/core/auth/user-schema'
import { sendEmail } from '@/core/email/email.server'
import VerificationEmail from '@/core/email/templates/auth/verification-code'
import { checkHoneypot } from '@/core/honeypot.server'
import { db } from '@/db/db.server'
import { Users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { parseWithZod } from '@conform-to/zod'
import { json, redirect } from '@remix-run/cloudflare'
import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { useFetcher, Link } from '@remix-run/react'
import { z } from 'zod'
import { prepareVerification } from './verify/verify.server'
import { Logo } from '@/components/ui/logos'

const ForgotPasswordSchema = z.object({
  email: EmailSchema,
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  checkHoneypot(formData)
  const submission = await parseWithZod(formData, {
    schema: ForgotPasswordSchema.superRefine(async (data, ctx) => {
      const [user] = await db
        .select()
        .from(Users)
        .where(eq(Users.email, data.email))
        .limit(1)

      if (!user) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'No user exists with this email',
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

  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1)
  if (!user) {
    throw new Error('User not found')
  }

  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    type: 'reset-password',
    target: user.email,
  })

  const response = await sendEmail({
    to: user.email,
    subject: 'Gingga - Password Reset',
    react: <VerificationEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
  })

  if (response.status === 'success') {
    return redirect(redirectTo.toString())
  }

  return json(
    { result: submission.reply({ formErrors: [response.error.message] }) },
    { status: 500 },
  )
}

export const meta: MetaFunction = () => {
  return [{ title: 'Password Recovery' }]
}

export default function ForgotPasswordRoute() {
  const forgotPassword = useFetcher<typeof action>()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <Link to="/" className="mb-5">
        <Logo />
      </Link>

      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-200">
            Forgot your password?
          </CardTitle>
          <p className="text-sm text-gray-400">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </CardHeader>

        <CardContent className="text-gray-300">
          <AppForm
            schema={ForgotPasswordSchema}
            lastResult={forgotPassword.data?.result}
            Form={forgotPassword.Form}
          >
            <ForgotPasswordForm />
          </AppForm>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
