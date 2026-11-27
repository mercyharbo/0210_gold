'use client'

import { useFormContext } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { CheckoutDetails } from '@/lib/validations/checkout-details'

type CheckoutTextFieldProps = {
  name: Exclude<keyof CheckoutDetails, 'state' | 'local_area'>
  label: string
  autoComplete: string
  type?: 'text' | 'email' | 'tel'
}

export function CheckoutTextField({ name, label, autoComplete, type = 'text' }: CheckoutTextFieldProps) {
  const { register, formState: { errors } } = useFormContext<CheckoutDetails>()
  const error = errors[name]
  const inputId = `checkout-${name}`

  return (
    <Field className='min-w-0 gap-2' data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={inputId} className='text-sm font-medium'>{label}</FieldLabel>
      <Input
        id={inputId}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className='h-12 rounded-none border-gray-200 bg-gray-50'
        {...register(name)}
      />
      <FieldError id={`${inputId}-error`} errors={[error]} />
    </Field>
  )
}
