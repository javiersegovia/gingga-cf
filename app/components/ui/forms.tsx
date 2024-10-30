import {
  FormProvider,
  getInputProps,
  getTextareaProps,
  useField,
  useForm,
  useInputControl,
} from '@conform-to/react'
import type {
  DefaultValue,
  Submission,
  SubmissionResult,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import type { CheckboxProps } from '@radix-ui/react-checkbox'
import { Form as RemixForm } from '@remix-run/react'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import type { OTPInputProps } from 'input-otp'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import type { z } from 'zod'
import { Checkbox } from './checkbox'
import { Input } from './input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './input-otp'
import { Label } from './label'
import { Textarea } from './textarea'
import { cn } from '@/core/utils'

interface OnValidateArgs {
  form: HTMLFormElement
  formData: FormData
  submitter: HTMLInputElement | HTMLButtonElement | null
}

interface AppFormProps<T> {
  formId?: string
  schema: z.ZodSchema<T>
  method?: 'get' | 'post'
  lastResult?: SubmissionResult | null | undefined // Adjust type as necessary based on your application's needs
  defaultValue?: DefaultValue<Partial<T>>
  onValidate?: (context: OnValidateArgs) => Submission<Partial<T>, string[], T>
  children: ReactNode
  Form?: typeof RemixForm // New prop for custom Form component
}

function formDefaultValidate<T>(schema: z.ZodSchema<T>) {
  return (context: OnValidateArgs) => parseWithZod(context.formData, { schema })
}

export function AppForm<T>({
  formId,
  schema,
  method = 'post',
  lastResult,
  defaultValue,
  onValidate,
  children,
  Form = RemixForm, // Default to RemixForm if not provided
}: AppFormProps<T>) {
  const fallbackId = useId()
  const [form] = useForm({
    id: formId ?? fallbackId,
    constraint: getZodConstraint(schema),
    lastResult,
    defaultValue,
    shouldRevalidate: 'onBlur',
    onValidate: onValidate ?? formDefaultValidate(schema),
  })

  return (
    <FormProvider context={form.context}>
      <Form id={form.id} method={method}>
        <HoneypotInputs />

        {children}
      </Form>
    </FormProvider>
  )
}

export type ListOfErrors = Array<string | null | undefined> | null | undefined

export function ErrorList({
  id,
  errors,
}: {
  errors?: ListOfErrors
  id?: string
}) {
  const errorsToRender = errors?.filter(Boolean)
  if (!errorsToRender?.length) return null
  return (
    <ul id={id} className="flex flex-col gap-1">
      {errorsToRender.map((e) => (
        <li key={e} className="text-sm text-destructive">
          {e}
        </li>
      ))}
    </ul>
  )
}

export function InputField({
  name,
  type,
  labelProps,
  inputProps,
  errors,
  className,
  shouldDisplayError = true,
}: {
  name: string
  type: Parameters<typeof getInputProps>[1]['type']
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  errors?: ListOfErrors
  className?: string
  shouldDisplayError?: boolean
}) {
  const [meta] = useField(name)

  const fallbackId = useId()
  const id = meta.id ?? fallbackId

  const errorId =
    errors?.length || meta.errors?.length ? `${id}-error` : undefined

  return (
    <div className={className}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <Input
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...getInputProps(meta, { type, ariaAttributes: false })}
        {...inputProps}
      />

      {shouldDisplayError && (
        <div className="min-h-[32px] px-3 pb-3 pt-1">
          {errorId ? (
            <ErrorList id={errorId} errors={errors || meta.errors} />
          ) : null}
        </div>
      )}
    </div>
  )
}

export function OTPField({
  name,
  labelProps,
  inputProps,
  errors,
  className,
}: {
  name: string
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
  inputProps?: Partial<OTPInputProps & { render: never }>
  errors?: ListOfErrors
  className?: string
}) {
  const [meta] = useField(name)

  const fallbackId = useId()
  const id = meta.id ?? fallbackId

  const errorId =
    errors?.length || meta.errors?.length ? `${id}-error` : undefined

  return (
    <div className={className}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <InputOTP
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        maxLength={6}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...getInputProps(meta, { type: 'text' })}
        {...inputProps}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <div className="min-h-[32px] px-4 pb-3 pt-1">
        {errorId ? (
          <ErrorList id={errorId} errors={errors || meta.errors} />
        ) : null}
      </div>
    </div>
  )
}

export function HiddenInputField({ name }: { name: string }) {
  const [meta] = useField(name)
  return <input {...getInputProps(meta, { type: 'hidden' })} />
}

export function CheckboxField({
  labelProps,
  buttonProps,
  errors,
  name,
  className,
}: {
  name: string
  labelProps: JSX.IntrinsicElements['label']
  buttonProps?: CheckboxProps & {
    form: string
    value?: string
  }
  errors?: ListOfErrors
  className?: string
}) {
  const { key, defaultChecked, ...checkboxProps } = buttonProps ?? {}
  const fallbackId = useId()
  const checkedValue = buttonProps?.value ?? 'on'

  const [meta] = useField(name)

  const input = useInputControl({
    key,
    name: meta.name,
    formId: meta.formId,
    initialValue: defaultChecked ? checkedValue : undefined,
  })
  const id = meta.id ?? fallbackId
  const errorId =
    errors?.length || meta.errors?.length ? `${id}-error` : undefined

  return (
    <div className={className}>
      <div className="flex gap-2 items-center">
        <Checkbox
          {...checkboxProps}
          id={id}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          checked={input.value === checkedValue}
          onCheckedChange={(state) => {
            input.change(state.valueOf() ? checkedValue : '')
            buttonProps?.onCheckedChange?.(state)
          }}
          onFocus={(event) => {
            input.focus()
            buttonProps?.onFocus?.(event)
          }}
          onBlur={(event) => {
            input.blur()
            buttonProps?.onBlur?.(event)
          }}
          type="button"
        />
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label
          htmlFor={id}
          {...labelProps}
          className={cn(
            'text-body-xs self-center cursor-pointer text-neutral-300',
            labelProps?.className,
          )}
        />
      </div>

      <div className="px-4 pb-3 pt-1">
        {errorId ? (
          <ErrorList id={errorId} errors={errors || meta.errors} />
        ) : null}
      </div>
    </div>
  )
}

export function TextareaField({
  name,
  labelProps,
  textareaProps,
  errors,
  className,
  shouldDisplayError = true,
}: {
  name: string
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
  errors?: ListOfErrors
  className?: string
  shouldDisplayError?: boolean
}) {
  const [meta] = useField(name)

  const fallbackId = useId()
  const id = meta.id ?? fallbackId

  const errorId =
    errors?.length || meta.errors?.length ? `${id}-error` : undefined

  return (
    <div className={className}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <Textarea
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...getTextareaProps(meta, { ariaAttributes: false })}
        {...textareaProps}
      />

      {shouldDisplayError && (
        <div className="min-h-[32px] px-3 pb-3 pt-1">
          {errorId ? (
            <ErrorList id={errorId} errors={errors || meta.errors} />
          ) : null}
        </div>
      )}
    </div>
  )
}
