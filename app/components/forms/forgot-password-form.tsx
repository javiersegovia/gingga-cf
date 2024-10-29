import { InputField } from '@/components/ui/forms'
import { FormStatusButton } from '@/components/ui/status-button'
import { Link } from '@remix-run/react'
import { $path } from 'remix-routes'

export function ForgotPasswordForm() {
  return (
    <>
      <InputField
        name="email"
        type="text"
        labelProps={{ children: 'Email' }}
        inputProps={{
          autoFocus: true,
          autoComplete: 'email',
        }}
      />

      <FormStatusButton size="xl" className="w-full" type="submit">
        Recover password
      </FormStatusButton>

      <div className="mt-4 text-center text-sm text-gray-300">
        Remember your password?{' '}
        <Link
          to={$path('/login', {})}
          className="text-yellow-400 hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </>
  )
}
