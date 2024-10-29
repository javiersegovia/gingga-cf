import { InputField } from '@/components/ui/forms'
import { FormStatusButton } from '@/components/ui/status-button'

export function AccountForm() {
  return (
    <div className="flex flex-col gap-4">
      <InputField
        type="text"
        name="firstName"
        labelProps={{ children: 'First Name' }}
        inputProps={{
          autoComplete: 'given-name',
        }}
      />
      <InputField
        type="text"
        name="lastName"
        labelProps={{ children: 'Last Name' }}
        inputProps={{
          autoComplete: 'family-name',
        }}
      />
      <FormStatusButton type="submit">Save</FormStatusButton>
    </div>
  )
}
