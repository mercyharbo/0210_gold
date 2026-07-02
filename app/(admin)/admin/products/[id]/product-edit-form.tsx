'use client'

import { Save, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, useEffect, useState, useTransition } from 'react'

import { ProductOptionMultiSelect } from '@/components/admin/product-option-multi-select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { CategoryOption } from '@/types/category'
import type { AdminProductListItem } from '@/types/product'
import {
  deleteProductAction,
  updateProductAction,
  type ProductActionResult,
} from '../actions'

type ProductEditFormProps = {
  categories: CategoryOption[]
  product: AdminProductListItem
}

function formatOptionLabel(option: string) {
  return option
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function ProductToast({
  onDismiss,
  result,
}: {
  onDismiss: () => void
  result: ProductActionResult
}) {
  if (!result) {
    return null
  }

  return (
    <div
      aria-live='polite'
      className='pointer-events-none fixed left-4 right-4 top-4 z-50 sm:left-1/2 sm:right-auto sm:w-full sm:max-w-lg sm:-translate-x-1/2'
    >
      <div className='pointer-events-auto flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-lg'>
        <p className='min-w-0 flex-1 leading-6'>{result.message}</p>
        <Button
          type='button'
          variant='ghost'
          size='icon-xs'
          className='shrink-0 text-red-800 hover:bg-red-100 hover:text-red-950'
          onClick={onDismiss}
        >
          <X className='size-4' />
          <span className='sr-only'>Dismiss notification</span>
        </Button>
      </div>
    </div>
  )
}

export function ProductEditForm({
  categories,
  product,
}: ProductEditFormProps) {
  const productImages =
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : [product.image_src]
  const [result, setResult] = useState<ProductActionResult>(null)
  const [isPending, startTransition] = useTransition()
  const [keptImages, setKeptImages] = useState(productImages)
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

  function toggleImage(imageUrl: string) {
    setKeptImages((currentImages) =>
      currentImages.includes(imageUrl)
        ? currentImages.filter((currentImage) => currentImage !== imageUrl)
        : [...currentImages, imageUrl],
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(null)

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      setResult(await updateProductAction(product.id, null, formData))
    })
  }

  function handleDelete() {
    const formData = new FormData()
    formData.set('productId', product.id)

    startTransition(async () => {
      await deleteProductAction(formData)
    })
  }

  return (
    <>
      <ProductToast
        result={toast}
        onDismiss={() => toast && setDismissedToastId(toast.id)}
      />

      <form onSubmit={handleSubmit} className='grid gap-6 md:grid-cols-3'>
        {keptImages.map((imageUrl) => (
          <input
            key={imageUrl}
            type='hidden'
            name='existingImageUrls'
            value={imageUrl}
          />
        ))}

        <div className='flex flex-col gap-6 md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Product Information
              </CardTitle>
              <CardDescription className='text-sm'>
                Update customer-facing product details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field>
                    <FieldLabel htmlFor='name'>Product Name</FieldLabel>
                    <Input
                      id='name'
                      name='name'
                      required
                      defaultValue={product.name}
                      className='h-11'
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='slug'>Slug</FieldLabel>
                    <Input
                      id='slug'
                      name='slug'
                      required
                      defaultValue={product.slug}
                      className='h-11'
                    />
                    <FieldDescription>
                      Keep this stable if the product is already linked publicly.
                    </FieldDescription>
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor='description'>Description</FieldLabel>
                  <Textarea
                    id='description'
                    name='description'
                    required
                    rows={5}
                    defaultValue={product.description}
                  />
                </Field>

                <div className='grid gap-4 md:grid-cols-3'>
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      name='categoryId'
                      defaultValue={product.category_id}
                      required
                    >
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
                    <Select
                      name='pricingType'
                      defaultValue={product.pricing_type}
                      required
                    >
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
                    <Select name='status' defaultValue={product.status} required>
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
                Update price, request pricing, and stock count.
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
                      defaultValue={product.price ?? ''}
                      className='h-11'
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
                      defaultValue={product.stock}
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
                Update sizes, colors, labels, and detail bullets.
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
                      defaultValue={product.sizes}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Colors</FieldLabel>
                    <ProductOptionMultiSelect
                      name='colors'
                      options={productColorOptions}
                      placeholder='Select colors'
                      defaultValue={product.colors}
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Label</FieldLabel>
                  <Select name='label' defaultValue={product.label ?? 'none'}>
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
                <Field>
                  <FieldLabel htmlFor='details'>Product Details</FieldLabel>
                  <Textarea
                    id='details'
                    name='details'
                    rows={4}
                    defaultValue={product.details.join('\n')}
                  />
                  <FieldDescription>
                    Add one product detail per line.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Product Images
              </CardTitle>
              <CardDescription className='text-sm'>
                Keep, remove, replace, or add images for this product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid gap-3'>
                  {productImages.map((imageUrl, index) => {
                    const kept = keptImages.includes(imageUrl)

                    return (
                      <label
                        key={`${imageUrl}-${index}`}
                        className='grid gap-3 rounded-lg border border-border p-3'
                      >
                        <div className='overflow-hidden rounded-md bg-muted'>
                          <Image
                            src={imageUrl}
                            alt={`${product.image_alt} ${index + 1}`}
                            width={640}
                            height={640}
                            unoptimized
                            className='aspect-square w-full object-cover'
                          />
                        </div>
                        <span className='flex items-start gap-3'>
                          <Checkbox
                            checked={kept}
                            onCheckedChange={() => toggleImage(imageUrl)}
                            className='translate-y-0.5'
                          />
                          <span className='flex flex-col gap-1'>
                            <span className='text-sm font-medium text-foreground'>
                              Keep image {index + 1}
                            </span>
                            <span className='text-sm leading-6 text-muted-foreground'>
                              Uncheck to remove it when saving.
                            </span>
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>

                <Field>
                  <FieldLabel htmlFor='imageFiles'>Add Product Images</FieldLabel>
                  <Input
                    id='imageFiles'
                    name='imageFiles'
                    type='file'
                    accept='image/avif,image/jpeg,image/png,image/webp'
                    multiple
                    className='h-11'
                  />
                  <FieldDescription>
                    Keep and upload 8 images or fewer. To replace all images,
                    uncheck existing images and upload new ones.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor='imageAlt'>Image Alt Text</FieldLabel>
                  <Textarea
                    id='imageAlt'
                    name='imageAlt'
                    required
                    rows={3}
                    defaultValue={product.image_alt}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Actions
              </CardTitle>
              <CardDescription className='text-sm'>
                Save this product or return to the catalog.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-3'>
                <Button type='submit' disabled={isPending} aria-busy={isPending}>
                  {isPending ? (
                    <Spinner className='size-4' />
                  ) : (
                    <Save className='size-4' />
                  )}
                  {isPending ? 'Saving Product' : 'Save Product'}
                </Button>
                <Button asChild variant='outline'>
                  <Link href='/admin/products'>Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='border-destructive/30'>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold text-destructive'>
                Delete Product
              </CardTitle>
              <CardDescription className='text-sm'>
                Remove this product and its uploaded product-media images.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type='button'
                variant='destructive'
                disabled={isPending}
                className='w-full justify-center'
                onClick={handleDelete}
              >
                <Trash2 className='size-4' />
                Delete Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  )
}
