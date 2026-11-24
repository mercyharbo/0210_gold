'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categoryTypeOptions } from '@/lib/categories/category-options'
import type { CategoryFormValues } from '@/lib/validations/admin-category'

export function CategoryDetailsFields() {
  const { register, control, formState: { errors } } = useFormContext<CategoryFormValues>()
  return (
    <Card className='md:col-span-2'>
      <CardHeader><CardTitle>Category information</CardTitle></CardHeader>
      <CardContent>
        <FieldGroup>
          {(['name', 'slug'] as const).map((name) => (
            <Field key={name} data-invalid={!!errors[name]}>
              <FieldLabel htmlFor={name}>{name === 'name' ? 'Category name' : 'URL slug'}</FieldLabel>
              <Input id={name} {...register(name)} aria-invalid={!!errors[name]} />
              <FieldError>{errors[name]?.message}</FieldError>
            </Field>
          ))}
          <Controller name='category_type' control={control} render={({ field }) => (
            <Field data-invalid={!!errors.category_type}>
              <FieldLabel htmlFor='category-type'>Category type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id='category-type' ref={field.ref} onBlur={field.onBlur} aria-invalid={!!errors.category_type}><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{categoryTypeOptions.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <FieldError>{errors.category_type?.message}</FieldError>
            </Field>
          )} />
          <Field data-invalid={!!errors.description}>
            <FieldLabel htmlFor='description'>Description</FieldLabel>
            <Textarea id='description' {...register('description')} aria-invalid={!!errors.description} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export function CategoryVisibilityFields() {
  const { register, control, formState: { errors } } = useFormContext<CategoryFormValues>()
  return (
    <Card>
      <CardHeader><CardTitle>Visibility and ordering</CardTitle></CardHeader>
      <CardContent>
        <FieldGroup>
          {(['is_active', 'is_featured'] as const).map((name) => (
            <Controller key={name} name={name} control={control} render={({ field }) => (
              <Field orientation='horizontal'>
                <Checkbox id={name} checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} ref={field.ref} />
                <FieldLabel htmlFor={name}>{name === 'is_active' ? 'Active category' : 'Featured collection'}</FieldLabel>
              </Field>
            )} />
          ))}
          {(['sort_order', 'featured_sort_order'] as const).map((name) => (
            <Field key={name} data-invalid={!!errors[name]}>
              <FieldLabel htmlFor={name}>{name === 'sort_order' ? 'Sort order' : 'Featured sort order'}</FieldLabel>
              <Input id={name} type='number' min={0} step={1} {...register(name, { valueAsNumber: true })} aria-invalid={!!errors[name]} />
              <FieldError>{errors[name]?.message}</FieldError>
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
