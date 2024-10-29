import { CheckboxField, InputField } from '@/components/ui/forms'
import { FormStatusButton } from '@/components/ui/status-button'

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

      <InputField
        name="password"
        type="password"
        labelProps={{ children: 'Password' }}
        inputProps={{
          type: 'password',
          autoComplete: 'new-password',
        }}
      />

      <InputField
        name="confirmPassword"
        type="password"
        labelProps={{ children: 'Confirm Password' }}
        inputProps={{
          type: 'password',
          autoComplete: 'new-password',
        }}
      />

      <CheckboxField
        name="agreeToTermsOfServiceAndPrivacyPolicy"
        labelProps={{
          children: 'Do you agree to our Terms of Service and Privacy Policy?',
        }}
      />

      <CheckboxField
        name="remember"
        labelProps={{
          children: 'Remember me',
        }}
      />

      <FormStatusButton className="w-full" type="submit">
        Create account
      </FormStatusButton>
    </>
  )
}
