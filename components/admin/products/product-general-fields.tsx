'use client'

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createSlug } from '@/lib/slug'
import type { CatalogCategory } from '@/types/catalog'
import type { ProductFormValues } from '@/lib/validations/admin-product'
import { ProductInput, ProductSelect } from './product-input'

export function ProductGeneralFields({ categories, autoSlug }: { categories: CatalogCategory[]; autoSlug: boolean }) {
  const { register, getValues, setValue, formState: { errors, isSubmitted } } = useFormContext<ProductFormValues>()
  const nameField = register('name')
  return (
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'><CardTitle><h2 className='font-sans text-base font-semibold'>Product information</h2></CardTitle></CardHeader>
      <CardContent>
        <FieldGroup className='gap-5'>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor='name'>Product name</FieldLabel>
            <Input id='name' className='h-11 rounded-md' {...nameField} aria-invalid={!!errors.name} onChange={(event) => {
              const slug = getValues('slug')
              if (autoSlug && (!slug || slug === createSlug(getValues('name'))))
                setValue('slug', createSlug(event.target.value), { shouldDirty: true, shouldValidate: isSubmitted })
              void nameField.onChange(event)
            }} />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <div className='grid gap-5 sm:grid-cols-2'>
            <ProductInput name='slug' label='URL slug' />
            <ProductSelect name='category_id' label='Category' placeholder='Choose a category' options={categories.map((category) => ({
              value: category.id, label: `${category.name}${category.is_active === false ? ' (inactive)' : ''}`,
            }))} />
          </div>
          <ProductInput name='description' label='Description' multiline />
          {!categories.length && <p className='text-sm text-gray-600'>Create a category before saving a product.</p>}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
