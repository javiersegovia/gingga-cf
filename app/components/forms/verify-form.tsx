import { OTPField, ErrorList, HiddenInputField } from '@/components/ui/forms'
import { FormStatusButton } from '@/components/ui/status-button'
import { useFormMetadata } from '@conform-to/react'

export function VerifyForm() {
  const form = useFormMetadata()

  return (
    <div>
      <div>
        <ErrorList errors={form.errors} id={form.errorId} />
      </div>

      <OTPField
        name="code"
        labelProps={{ children: 'Verification Code' }}
        inputProps={{ maxLength: 6 }}
      />

      <HiddenInputField name="type" />
      <HiddenInputField name="target" />
      <HiddenInputField name="redirectTo" />

      <FormStatusButton className="w-full" size="xl" type="submit">
        Submit
      </FormStatusButton>
    </div>
  )
}
