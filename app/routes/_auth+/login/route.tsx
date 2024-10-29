import { LoginForm } from '@/components/forms/login-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppForm } from '@/components/ui/forms'
import { Logo } from '@/components/ui/logos'
import { login, requireAnonymous } from '@/core/auth/auth.server'
import { EmailSchema, PasswordSchema } from '@/core/auth/user-schema'
import { checkHoneypot } from '@/core/honeypot.server'
import { parseWithZod } from '@conform-to/zod'
import { json } from '@remix-run/cloudflare'
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/cloudflare'
import { Link, useActionData } from '@remix-run/react'
import { $path } from 'remix-routes'
import { z } from 'zod'
import { handleNewSession } from './login.server'

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
  remember: z.boolean().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)
  const formData = await request.formData()
  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null }

        const session = await login(data)
        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['email'],
            message: 'Invalid email or password',
          })
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['password'],
            message: 'Invalid email or password',
          })
          return z.NEVER
        }

        return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    return json(
      { result: submission.reply({ hideFields: ['password'] }) },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { session, remember, redirectTo } = submission.value

  return handleNewSession({
    request,
    session,
    remember: remember ?? false,
    redirectTo,
  })
}

export default function LoginRoute() {
  const actionData = useActionData<typeof action>()

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
            If you are already a member, come in
          </p>
        </CardHeader>

        <CardContent className="text-gray-300">
          <AppForm
            formId="login-form"
            schema={LoginFormSchema}
            lastResult={actionData?.result}
          >
            <LoginForm />
          </AppForm>
        </CardContent>
      </Card>
    </div>
  )
}
