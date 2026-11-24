'use client'

import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProductFormValues } from '@/lib/validations/admin-product'
import { productKaratOptions } from '@/lib/products/product-options'
import { ProductInput, ProductSelect } from './product-input'
import { ProductOptions } from './product-options'

export function ProductPricingFields() {
  const { control, setValue } = useFormContext<ProductFormValues>()
  const goldPricing = useWatch({ control, name: 'is_gold_karat_priced' })
  return (
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'><CardTitle><h2 className='font-sans text-base font-semibold'>Pricing</h2></CardTitle></CardHeader>
      <CardContent>
        <FieldGroup className='gap-5'>
          <Controller name='is_gold_karat_priced' control={control} render={({ field }) => (
            <Field>
              <FieldLabel htmlFor='pricing-method'>Calculation method</FieldLabel>
              <Select value={field.value ? 'gold' : 'fixed'} onValueChange={(value) => {
                field.onChange(value === 'gold')
                if (value === 'fixed') {
                  setValue('pricing_type', 'fixed', { shouldDirty: true })
                  setValue('making_charge', '0', { shouldDirty: true })
                }
              }}>
                <SelectTrigger id='pricing-method' ref={field.ref} size='lg' className='w-full rounded-md'><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value='fixed'>Configured price</SelectItem><SelectItem value='gold'>Manual gold rates</SelectItem></SelectGroup></SelectContent>
              </Select>
            </Field>
          )} />
          {!goldPricing && <ProductInput name='price' label='Price (NGN)' />}
          <ProductInput name='gold_weight_grams' label={goldPricing ? 'Gold weight (grams)' : 'Weight (grams, optional)'} />
          {goldPricing && <ProductInput name='making_charge' label='Making charge (NGN)' />}
          <ProductOptions name='gold_karats' label='Karats' options={productKaratOptions} />
          <ProductSelect name='pricing_type' label='Price presentation' placeholder='Choose price presentation' options={[
            { value: 'fixed', label: 'Exact price' },
            ...(goldPricing ? [{ value: 'starting_from', label: 'Starting from' }] : []),
          ]} />
          {goldPricing && <p className='text-xs text-gray-600'>The server calculates weight × the selected karat rate + making charge. Publication requires valid rates for every selected karat.</p>}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
