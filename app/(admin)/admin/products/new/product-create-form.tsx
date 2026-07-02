'use client'

import { Save, X } from 'lucide-react'
import Link from 'next/link'
import { type FormEvent, useEffect, useState, useTransition } from 'react'

import { ProductIdentityFields } from '@/components/admin/product-identity-fields'
import { ProductOptionMultiSelect } from '@/components/admin/product-option-multi-select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  productColorOptions,
  productLabelOptions,
  productSizeOptions,
} from '@/lib/products/product-options'
import { cn } from '@/lib/utils'
import type { CategoryOption } from '@/types/category'
import { createProductAction } from '../actions'

type ProductCreateFormProps = {
  categories: CategoryOption[]
}

function formatOptionLabel(option: string) {
  return option
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function ProductCreateForm({ categories }: ProductCreateFormProps) {
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof createProductAction>
  >>(null)
  const [isPending, startTransition] = useTransition()
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null)
  const toast = result?.id === dismissedToastId ? null : result

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout = window.setTimeout(() => {
      setDismissedToastId(toast.id)
    }, 5000)

    return () => window.clearTimeout(timeout)
  }, [toast])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      setResult(await createProductAction(null, formData))
    })
  }

  return (
    <>
      {toast ? (
        <div
          aria-live='polite'
          className='pointer-events-none fixed left-1/2 top-4 z-50 w-[min(calc(100vw-2rem),32rem)] -translate-x-1/2'
        >
          <div
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
              'border-red-300 bg-red-50 text-red-900',
            )}
          >
            <p className='min-w-0 flex-1 leading-6'>{toast.message}</p>
            <Button
              type='button'
              variant='ghost'
              size='icon-xs'
              className='shrink-0 text-red-800 hover:bg-red-100 hover:text-red-950'
              onClick={() => setDismissedToastId(toast.id)}
            >
              <X className='size-4' />
              <span className='sr-only'>Dismiss notification</span>
            </Button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className='grid gap-6 md:grid-cols-3'>
        <div className='flex flex-col gap-6 md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Product Information
              </CardTitle>
              <CardDescription className='text-sm'>
                Enter customer-facing product details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <ProductIdentityFields />

                <Field>
                  <FieldLabel htmlFor='description'>Description</FieldLabel>
                  <Textarea
                    id='description'
                    name='description'
                    required
                    rows={5}
                    placeholder='Describe the item, fit, finish, or sourcing details.'
                  />
                </Field>

                <div className='grid gap-4 md:grid-cols-3'>
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <Select name='categoryId' required>
                      <SelectTrigger size='lg' className='w-full'>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Pricing Type</FieldLabel>
                    <Select name='pricingType' defaultValue='fixed' required>
                      <SelectTrigger size='lg' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='fixed'>Exact Price</SelectItem>
                        <SelectItem value='starting_from'>
                          Starting From
                        </SelectItem>
                        <SelectItem value='price_on_request'>
                          Price on Request
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select name='status' defaultValue='draft' required>
                      <SelectTrigger size='lg' className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='draft'>Draft</SelectItem>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='archived'>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Pricing and Stock
              </CardTitle>
              <CardDescription className='text-sm'>
                Use exact pricing, starting-from pricing, or leave pricing on
                request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field>
                    <FieldLabel htmlFor='price'>Price in Naira</FieldLabel>
                    <Input
                      id='price'
                      name='price'
                      inputMode='numeric'
                      className='h-11'
                      placeholder='50000'
                    />
                    <FieldDescription>
                      Required for exact and starting-from pricing. Leave empty
                      for price on request.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='stock'>Stock</FieldLabel>
                    <Input
                      id='stock'
                      name='stock'
                      type='number'
                      min='0'
                      defaultValue='0'
                      className='h-11'
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Product Attributes
              </CardTitle>
              <CardDescription className='text-sm'>
                Choose consistent values for filtering and display.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field>
                    <FieldLabel>Sizes</FieldLabel>
                    <ProductOptionMultiSelect
                      name='sizes'
                      options={productSizeOptions}
                      placeholder='Select sizes'
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Colors</FieldLabel>
                    <ProductOptionMultiSelect
                      name='colors'
                      options={productColorOptions}
                      placeholder='Select colors'
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor='details'>Product Details</FieldLabel>
                  <Textarea
                    id='details'
                    name='details'
                    rows={4}
                    placeholder={
                      'Gold-tone finish\nGift-ready styling\nEveryday to occasion wear'
                    }
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Media
              </CardTitle>
              <CardDescription className='text-sm'>
                Upload product images for admin catalog display.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='imageFiles'>Product Images</FieldLabel>
                  <Input
                    id='imageFiles'
                    name='imageFiles'
                    type='file'
                    accept='image/avif,image/jpeg,image/png,image/webp'
                    multiple
                    required
                    className='h-11'
                  />
                  <FieldDescription>
                    Upload up to 8 AVIF, JPEG, PNG, or WebP images. Each image
                    must be 5MB or smaller.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor='imageAlt'>Image Alt Text</FieldLabel>
                  <Textarea
                    id='imageAlt'
                    name='imageAlt'
                    required
                    rows={3}
                    placeholder='Gold jewellery styled on a clean studio surface'
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Product Organization
              </CardTitle>
              <CardDescription className='text-sm'>
                Add optional merchandising metadata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Label</FieldLabel>
                  <Select name='label' defaultValue='none'>
                    <SelectTrigger size='lg' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='none'>No label</SelectItem>
                      {productLabelOptions.map((label) => (
                        <SelectItem key={label} value={label}>
                          {formatOptionLabel(label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className='flex justify-end gap-3'>
                  <Button asChild variant='outline'>
                    <Link href='/admin/products'>Cancel</Link>
                  </Button>
                  <Button type='submit' disabled={isPending} aria-busy={isPending}>
                    {isPending ? (
                      <Spinner className='size-4' />
                    ) : (
                      <Save className='size-4' />
                    )}
                    {isPending ? 'Creating Product' : 'Create Product'}
                  </Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  )
}
