'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { useApiRequest } from '@/hooks/use-api-request'
import { useToast } from '@/stores/hooks/use-toast'
import { ApiError } from '@/lib/api/client'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import { categoryFormSchema, categoryFormValues, type CategoryFormValues } from '@/lib/validations/admin-category'
import type { CatalogCategory } from '@/types/catalog'
import type { components } from '@/types/api-schema'
import { CategoryDetailsFields, CategoryVisibilityFields } from './category-fields'
import { CategoryImage } from './category-image'

export function CategoryForm({ category }: { category?: CatalogCategory }) {
  const router = useRouter()
  const { cache, mutate } = useSWRConfig()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const request = useApiRequest<CatalogCategory, components['schemas']['CategoryBody']>()
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema), defaultValues: categoryFormValues(category),
  })
  const busy = request.loading || form.formState.isSubmitting || uploading

  const submit = form.handleSubmit(async (values) => {
    if (uploading) return
    let saved: CatalogCategory
    try {
      const payload: components['schemas']['CategoryBody'] = {
        ...values, description: values.description || null,
        images: values.images.map(({ media_id, alt }) => ({ media_id, alt })),
      }
      const response = category
        ? await request.execute('put', `/admin/categories/${category.id}`, payload)
        : await request.execute('post', '/admin/categories', payload)
      if (!response.data) throw new Error('The server did not return the saved category.')
      saved = response.data
      form.reset(categoryFormValues(saved))
      toast(response.message || 'Category saved successfully.', 'success')
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        let focus = true
        for (const [name, messages] of Object.entries(error.fieldErrors)) {
          if (!(name.split('.')[0] in values)) continue
          form.setError(name as FieldPath<CategoryFormValues>, { message: messages.join(' ') }, { shouldFocus: focus })
          focus = false
        }
      }
      toast(error instanceof Error ? error.message : 'Unable to save the category.', 'failure')
      return
    }
    // A cache failure must never turn a successful save into a repeat POST/PUT.
    try {
      await mutate((key) => affectedCatalogKey(key, 'categories'))
      if (cache.get('/api/admin/categories')?.error) throw new Error('Refresh failed')
    } catch {
      toast('Category saved, but refreshing failed. Refresh the list to see the latest data.', 'warning')
    }
    router.push('/admin/categories')
    router.refresh()
  })

  return (
    <section className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <AdminPageHeader title={category ? 'Edit category' : 'Add category'} description='Manage product collections and optional storefront featured cards.' />
        <Button variant='outline' asChild><Link href='/admin/categories'>Back to categories</Link></Button>
      </div>
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate className='flex flex-col gap-6'>
          <fieldset disabled={busy} className='grid min-w-0 gap-6 md:grid-cols-3'>
            <CategoryDetailsFields />
            <CategoryVisibilityFields />
            <CategoryImage onBusy={setUploading} />
          </fieldset>
          {uploading && <p role='status' className='text-sm'>Uploading and validating image…</p>}
          <div className='flex justify-end'>
            <Button type='submit' disabled={busy} aria-busy={busy} className='bg-black text-white hover:bg-gold'>
              {uploading ? 'Uploading…' : busy ? 'Saving…' : 'Save category'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </section>
  )
}
