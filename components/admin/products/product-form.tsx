'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { useApiRequest } from '@/hooks/use-api-request'
import { useToast } from '@/stores/hooks/use-toast'
import { ApiError } from '@/lib/api/client'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import { productFormSchema, productFormValues, productPayload, type ProductFormValues, type ProductWrite } from '@/lib/validations/admin-product'
import type { CatalogCategory, CatalogProduct } from '@/types/catalog'
import { ProductGeneralFields } from './product-general-fields'
import { ProductPricingFields } from './product-pricing-fields'
import { ProductSettingsFields, ProductOptionalFields } from './product-settings-fields'
import { ProductImages } from './product-images'

export function ProductForm({ product, categories }: { product?: CatalogProduct; categories: CatalogCategory[] }) {
  const router = useRouter()
  const { cache, mutate } = useSWRConfig()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const { execute, loading } = useApiRequest<CatalogProduct, ProductWrite>()
  const form = useForm<ProductFormValues>({ resolver: zodResolver(productFormSchema), defaultValues: productFormValues(product) })
  const busy = loading || uploading || form.formState.isSubmitting

  async function handleCreateProduct(values: ProductFormValues) {
    const payload = productPayload(values)
    return execute('post', '/admin/products', payload)
  }

  async function handleUpdateProduct(values: ProductFormValues) {
    if (!product) throw new Error('Product unavailable.')
    const payload = productPayload(values)
    return execute('put', `/admin/products/${encodeURIComponent(product.id)}`, payload)
  }

  const handleSaveProduct = form.handleSubmit(async (values) => {
    if (uploading) return
    try {
      const response = product ? await handleUpdateProduct(values) : await handleCreateProduct(values)
      if (!response.data?.id) throw new Error('The server did not return the saved product.')
      form.reset(productFormValues(response.data))
      toast(response.message || 'Product saved successfully.', 'success')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        let focus = true
        for (const [name, messages] of Object.entries(error.fieldErrors)) {
          if (!(name.split('.')[0] in values)) continue
          form.setError(name as FieldPath<ProductFormValues>, { message: messages.join(' ') }, { shouldFocus: focus })
          if (focus && name === 'images') document.getElementById('product-images-button')?.focus()
          focus = false
        }
      }
      toast(error instanceof Error ? error.message : 'Unable to save the product.', 'failure')
      return
    }
    // Revalidation is separate: a saved product must never be submitted again on refresh failure.
    try {
      await mutate((key) => affectedCatalogKey(key, 'products'))
      if ([...cache.keys()].some((key) => affectedCatalogKey(key, 'products') && cache.get(key)?.error)) throw new Error('Refresh failed')
    } catch {
      toast('Product saved, but refreshing failed. Refresh the list.', 'warning')
    }
    router.push('/admin/products')
    router.refresh()
  }, (errors) => {
    if (Object.keys(errors)[0] === 'images' && (errors.images?.message || errors.images?.root?.message))
      document.getElementById('product-images-button')?.focus()
  })

  return (
    <section className='flex flex-col gap-6'>
      <FormProvider {...form}>
        <form onSubmit={handleSaveProduct} noValidate className='flex flex-col gap-6'>
          <div className='flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-start'>
            <AdminPageHeader title={product ? 'Edit product' : 'Add product'} description='Manage product details, images, pricing and availability.' />
            <div className='flex shrink-0 gap-3'>
              <Button type='button' variant='outline' disabled={busy} onClick={() => router.push('/admin/products')} className='h-11 flex-1 rounded-md px-5 sm:flex-none'>Cancel</Button>
              <Button type='submit' disabled={busy || !categories.length} aria-busy={busy} className='h-11 flex-1 rounded-md bg-black px-5 text-white hover:bg-gold sm:flex-none'>
                {uploading ? 'Uploading...' : busy ? 'Saving...' : 'Save product'}
              </Button>
            </div>
          </div>
          {product?.pricing_type === 'price_on_request' && <p role='alert' className='text-sm text-gray-600'>Choose supported pricing before saving or publishing this legacy draft.</p>}
          <fieldset disabled={busy} className='grid min-w-0 items-start gap-6 lg:grid-cols-3'>
            <div className='flex min-w-0 flex-col gap-6 lg:col-span-2'>
              <ProductGeneralFields categories={categories} autoSlug={!product} />
              <ProductImages disabled={busy} onBusy={setUploading} />
              <ProductOptionalFields />
            </div>
            <div className='flex min-w-0 flex-col gap-6'>
              <ProductPricingFields />
              <ProductSettingsFields />
            </div>
          </fieldset>
          {uploading && <p role='status' className='text-sm'>Uploading and validating images...</p>}
        </form>
      </FormProvider>
    </section>
  )
}
