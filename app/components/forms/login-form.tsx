import { CheckboxField, InputField } from '@/components/ui/forms'
import { Spacer } from '@/components/ui/spacer'
import { FormStatusButton } from '@/components/ui/status-button'
import { Link } from '@remix-run/react'
import { $path } from 'remix-routes'

export function LoginForm() {
  return (
    <>
      <InputField
        name="email"
        type="email"
        labelProps={{ children: 'Email' }}
        inputProps={{
          autoComplete: 'email',
        }}
      />

      <InputField
        name="password"
        type="password"
        labelProps={{ children: 'Password' }}
        inputProps={{
          autoComplete: 'current-password',
        }}
      />

      <div className="flex justify-between">
        <CheckboxField
          name="remember"
          className="text-gray-300"
          labelProps={{
            children: 'Remember me',
          }}
        />
        <Link
          to={$path('/forgot-password')}
          className="text-gray-300 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <FormStatusButton size="xl" className="w-full" type="submit">
        Login
      </FormStatusButton>

      <Spacer size="4xs" />

      <div className="text-center text-sm">
        First time here?{' '}
        <Link
          to={$path('/register')}
          className="text-yellow-400 hover:underline"
        >
          Create account
        </Link>
      </div>
    </>
  )
}
