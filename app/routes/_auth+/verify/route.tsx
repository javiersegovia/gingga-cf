import type { VerificationTypes } from './verify.schema'

import { GeneralErrorBoundary } from '@/components/error-boundary'
import { VerifyForm } from '@/components/forms/verify-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppForm } from '@/components/ui/forms'
import { Logo } from '@/components/ui/logos'
import { checkHoneypot } from '@/core/honeypot.server'
import type { ActionFunctionArgs } from '@remix-run/cloudflare'
import { Link, useActionData, useSearchParams } from '@remix-run/react'
import { $path } from 'remix-routes'
import {
  VerificationTypeSchema,
  VerifySchema,
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
} from './verify.schema'
import { validateRequest } from './verify.server'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  checkHoneypot(formData)
  return validateRequest(request, formData)
}

const CheckEmail = (
  <>
    <CardTitle className="text-2xl font-bold text-gray-200">
      Please check your email
    </CardTitle>
    <p className="text-sm text-gray-400">
      We&apos;ve sent you a code to verify your email address
    </p>
  </>
)

export default function VerifyRoute() {
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()

  const parsedType = VerificationTypeSchema.safeParse(
    searchParams.get(typeQueryParam),
  )
  const type = parsedType.success ? parsedType.data : null

  const defaultValue = {
    code: searchParams.get(codeQueryParam),
    type: type,
    target: searchParams.get(targetQueryParam),
    redirectTo: searchParams.get(redirectToQueryParam),
  }

  const headings: Record<VerificationTypes, React.ReactNode> = {
    onboarding: CheckEmail,
    'reset-password': CheckEmail,
    'change-email': CheckEmail,
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <Link to={$path('/')} className="mb-5">
        <Logo />
      </Link>

      <Card className="w-full max-w-md border-gray-800 bg-gray-900">
        <CardHeader className="space-y-1 text-center">
          {type ? (
            headings[type]
          ) : (
            <CardTitle className="text-2xl font-bold text-gray-200">
              Invalid Verification Type
            </CardTitle>
          )}
        </CardHeader>

        <CardContent className="text-gray-300">
          <div className="flex w-full justify-center gap-2">
            <AppForm
              method="post"
              schema={VerifySchema}
              defaultValue={defaultValue}
              lastResult={actionData?.result}
            >
              <VerifyForm />
            </AppForm>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
