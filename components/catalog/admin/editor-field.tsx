'use client'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import type { CatalogDraft } from '@/lib/catalog/editor'

type FieldName = Exclude<keyof CatalogDraft, 'images' | 'is_active' | 'is_featured' | 'is_gold_karat_priced'>
export function EditorField({
  name,
  label,
  options,
  multiline,
  type = 'text',
}: {
  name: FieldName
  label: string
  options?: readonly { value: string; label: string }[]
  multiline?: boolean
  type?: string
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CatalogDraft>()
  const error = errors[name]
  const props = {
    id: name,
    ...register(name),
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : undefined,
  }
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {options ? (
        <select {...props} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <Textarea {...props} rows={4} />
      ) : (
        <Input {...props} type={type} />
      )}
      {error?.message && <FieldError id={`${name}-error`}>{error.message}</FieldError>}
    </Field>
  )
}

export function EditorCheck({
  name,
  label,
}: {
  name: 'is_active' | 'is_featured' | 'is_gold_karat_priced'
  label: string
}) {
  const { register } = useFormContext<CatalogDraft>()
  return (
    <Field orientation="horizontal">
      <input id={name} type="checkbox" {...register(name)} className="size-4" />
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
    </Field>
  )
}
