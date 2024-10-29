import { FormStatusButton } from '@/components/ui/status-button'
import { Link } from '@remix-run/react'
import { InputField } from '../ui/forms'
import { $path } from 'remix-routes'

export function RegisterForm() {
  return (
    <>
      <InputField
        name="email"
        type="email"
        className="text-gray-300"
        labelProps={{ children: 'Email' }}
        inputProps={{
          autoComplete: 'email',
        }}
      />

      <FormStatusButton size="xl" className="w-full" type="submit">
        Create account
      </FormStatusButton>

      <div className="mt-4 text-center text-sm text-gray-300">
        Already have an account?{' '}
        <Link
          to={$path('/login', {})}
          className="text-yellow-400 hover:underline"
        >
          Login
        </Link>
      </div>
    </>
  )
}
