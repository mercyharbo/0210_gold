'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'
import { productColorOptions, productLabelOptions, productSizeOptions } from '@/lib/products/product-options'
import { ProductInput, ProductSelect } from './product-input'
import { ProductOptions } from './product-options'

export function ProductSettingsFields() {
  return (
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'><CardTitle><h2 className='font-sans text-base font-semibold'>Inventory and visibility</h2></CardTitle></CardHeader>
      <CardContent>
        <FieldGroup className='gap-5'>
          <ProductInput name='stock' label='Stock shared across all options' />
          <ProductSelect name='status' label='Status' options={['draft', 'active', 'archived'].map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))} />
          <ProductSelect name='label' label='Product label' placeholder='No label' options={productLabelOptions.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))} />
          <p className='text-xs text-gray-600'>Use Featured to include this product in homepage featured sections. Active products require an active category, a purchase price and an image.</p>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export function ProductOptionalFields() {
  return (
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'><CardTitle><h2 className='font-sans text-base font-semibold'>Options and additional details</h2></CardTitle></CardHeader>
      <CardContent>
        <FieldGroup className='gap-5'>
          <div className='grid gap-5 sm:grid-cols-2'>
            <ProductOptions name='sizes' label='Sizes' options={productSizeOptions} />
            <ProductOptions name='colors' label='Colors' options={productColorOptions} />
          </div>
          <ProductInput name='details' label='Product details (one per line)' multiline />
          <ProductInput name='note' label='Additional note' multiline />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
