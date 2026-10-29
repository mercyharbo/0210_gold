'use client'

import { useFormContext } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function AuthField({
  name,
  label,
  type = 'text',
  autoComplete,
}: {
  name: string
  label: string
  type?: string
  autoComplete?: string
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = errors[name]
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        {...register(name)}
      />
      {error && (
        <FieldError id={`${name}-error`}>{String(error.message)}</FieldError>
      )}
    </Field>
  )
}
