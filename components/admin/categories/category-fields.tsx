'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categoryTypeOptions } from '@/lib/categories/category-options'
import { categorySlug } from '@/lib/categories/slug'
import type { CategoryFormValues } from '@/lib/validations/admin-category'

export function CategoryDetailsFields({ autoSlug = false }: { autoSlug?: boolean }) {
  const { register, control, getValues, setValue, formState: { errors, isSubmitted } } = useFormContext<CategoryFormValues>()
  const nameField = register('name')
  return (
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'>
        <CardTitle><h2 className='font-sans text-base font-semibold'>General information</h2></CardTitle>
        <CardDescription>The name and details customers see in your store.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className='grid gap-5 sm:grid-cols-2'>
          <Field data-invalid={!!errors.name} className='sm:col-span-2'>
            <FieldLabel htmlFor='name'>Category name</FieldLabel>
            <Input id='name' className='h-11 rounded-md' placeholder='e.g. Gold necklaces' {...nameField} aria-invalid={!!errors.name} onChange={(event) => {
              const previousSlug = categorySlug(getValues('name'))
              const slug = getValues('slug')
              // Follow the name on creation, while preserving a manually chosen slug.
              if (autoSlug && (!slug || slug === previousSlug)) {
                setValue('slug', categorySlug(event.target.value), { shouldDirty: true, shouldValidate: isSubmitted })
              }
              void nameField.onChange(event)
            }} />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <Field data-invalid={!!errors.slug}>
            <FieldLabel htmlFor='slug'>URL slug</FieldLabel>
            <Input id='slug' className='h-11 rounded-md' {...register('slug')} aria-invalid={!!errors.slug} />
            <FieldError>{errors.slug?.message}</FieldError>
          </Field>
          <Controller name='category_type' control={control} render={({ field }) => (
            <Field data-invalid={!!errors.category_type}>
              <FieldLabel htmlFor='category-type'>Category type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id='category-type' size='lg' className='w-full rounded-md' ref={field.ref} onBlur={field.onBlur} aria-invalid={!!errors.category_type}><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{categoryTypeOptions.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <FieldError>{errors.category_type?.message}</FieldError>
            </Field>
          )} />
          <Field data-invalid={!!errors.description} className='sm:col-span-2'>
            <FieldLabel htmlFor='description'>Description</FieldLabel>
            <Textarea id='description' className='min-h-28 resize-y rounded-md' placeholder='Describe this collection...' {...register('description')} aria-invalid={!!errors.description} />
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
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'>
        <CardTitle><h2 className='font-sans text-base font-semibold'>Organization</h2></CardTitle>
        <CardDescription>Choose where this collection appears.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className='gap-5'>
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
              <Input id={name} className='h-11 rounded-md' type='number' min={0} step={1} {...register(name, { valueAsNumber: true })} aria-invalid={!!errors[name]} />
              <FieldError>{errors[name]?.message}</FieldError>
            </Field>
          ))}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
