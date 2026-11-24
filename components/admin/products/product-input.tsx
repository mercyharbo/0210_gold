'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProductFormValues } from '@/lib/validations/admin-product'

type TextField = 'name' | 'slug' | 'description' | 'price' | 'gold_weight_grams' | 'making_charge' | 'stock' | 'details' | 'note'
type SelectField = 'category_id' | 'status' | 'label' | 'pricing_type'

export function ProductInput({ name, label, multiline = false, placeholder }: {
  name: TextField; label: string; multiline?: boolean; placeholder?: string
}) {
  const { register, formState: { errors } } = useFormContext<ProductFormValues>()
  return (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {multiline
        ? <Textarea id={name} {...register(name)} placeholder={placeholder} className='min-h-28 rounded-md' aria-invalid={!!errors[name]} />
        : <Input id={name} type={name === 'stock' ? 'number' : 'text'} min={name === 'stock' ? 0 : undefined}
          inputMode={['price', 'gold_weight_grams', 'making_charge'].includes(name) ? 'decimal' : undefined}
          {...register(name, { valueAsNumber: name === 'stock' })} placeholder={placeholder}
          className='h-11 rounded-md' aria-invalid={!!errors[name]} />}
      <FieldError>{errors[name]?.message}</FieldError>
    </Field>
  )
}

export function ProductSelect({ name, label, options, placeholder }: {
  name: SelectField; label: string; options: { value: string; label: string }[]; placeholder?: string
}) {
  const { control, formState: { errors } } = useFormContext<ProductFormValues>()
  return <Controller name={name} control={control} render={({ field }) => (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select value={field.value || '__none__'} onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}>
        <SelectTrigger id={name} ref={field.ref} onBlur={field.onBlur} size='lg' className='w-full rounded-md' aria-invalid={!!errors[name]}><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>
          <SelectItem value='__none__'>{placeholder ?? 'Select an option'}</SelectItem>
          {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
        </SelectGroup></SelectContent>
      </Select>
      <FieldError>{errors[name]?.message}</FieldError>
    </Field>
  )} />
}
