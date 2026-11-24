'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { ProductFormValues } from '@/lib/validations/admin-product'

export function ProductOptions({ name, label, options }: {
  name: 'sizes' | 'colors' | 'gold_karats'; label: string; options: readonly string[]
}) {
  const { control, formState: { errors } } = useFormContext<ProductFormValues>()
  return <Controller name={name} control={control} render={({ field }) => {
    const selected: readonly string[] = field.value
    return (
      <Field data-invalid={!!errors[name]}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button id={name} ref={field.ref} onBlur={field.onBlur} type='button' variant='outline'
              className='h-auto min-h-11 w-full justify-start whitespace-normal rounded-md text-left font-normal' aria-invalid={!!errors[name]}>
              {selected.length ? selected.join(', ') : `Choose ${label.toLowerCase()}`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='max-h-72 w-64 overflow-y-auto' align='start'>
            <div role='group' aria-label={label} className='flex flex-col gap-3'>
              {options.map((value) => (
                <label key={value} className='flex items-center gap-3 text-sm'>
                  <Checkbox checked={selected.includes(value)} onCheckedChange={(checked) => {
                    field.onChange(checked === true ? [...selected, value] : selected.filter((item) => item !== value))
                  }} />
                  {value}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <FieldError>{errors[name]?.message || errors[name]?.root?.message}</FieldError>
      </Field>
    )
  }} />
}
