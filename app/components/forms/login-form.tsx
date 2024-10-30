import { CheckboxField, InputField } from '@/components/ui/forms'
import { Spacer } from '@/components/ui/spacer'
import { FormStatusButton } from '@/components/ui/status-button'

export function LoginForm() {
  return (
    <>
      <InputField
        name="email"
        type="email"
        labelProps={{ children: 'Email' }}
        inputProps={{
          autoComplete: 'email',
          placeholder: 'Enter your email',
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
      </div>

      <Spacer size="4xs" />

      <FormStatusButton size="xl" className="w-full" type="submit">
        Send me a login code
      </FormStatusButton>
    </>
  )
}
