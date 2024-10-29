import { InputField } from '@/components/ui/forms'
import { FormStatusButton } from '@/components/ui/status-button'

export function ResetPasswordForm() {
  return (
    <>
      <InputField
        name="password"
        type="password"
        labelProps={{
          children: 'New Password',
        }}
        inputProps={{
          autoComplete: 'new-password',
          autoFocus: true,
        }}
      />
      <InputField
        name="confirmPassword"
        type="password"
        labelProps={{
          children: 'Confirm Password',
        }}
        inputProps={{
          autoComplete: 'new-password',
        }}
      />

      <FormStatusButton size="xl" className="w-full" type="submit">
        Reset password
      </FormStatusButton>
    </>
  )
}
