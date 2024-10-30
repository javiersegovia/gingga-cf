import { CheckboxField, InputField } from '@/components/ui/forms'
import { FormStatusButton } from '@/components/ui/status-button'
import { Spacer } from '../ui/spacer'

export function OnboardingForm() {
  return (
    <>
      <InputField
        name="firstName"
        type="text"
        labelProps={{ children: 'First Name' }}
        inputProps={{
          type: 'text',
          autoComplete: 'given-name',
        }}
      />

      <InputField
        name="lastName"
        type="text"
        labelProps={{ children: 'Last Name' }}
        inputProps={{
          type: 'text',
          autoComplete: 'family-name',
        }}
      />

      <CheckboxField
        name="agreeToTermsOfServiceAndPrivacyPolicy"
        labelProps={{
          children: 'Do you agree to our Terms of Service and Privacy Policy?',
          className: 'text-sm',
        }}
      />

      <CheckboxField
        name="remember"
        labelProps={{
          children: 'Remember me',
          className: 'text-sm',
        }}
      />

      <Spacer size="4xs" />

      <FormStatusButton size="xl" className="w-full" type="submit">
        Create account
      </FormStatusButton>
    </>
  )
}
