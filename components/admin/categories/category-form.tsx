'use client'

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
      <FormProvider {...form}>
        <form onSubmit={submit} noValidate className='flex flex-col gap-6'>
          <div className='flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-start'>
            <AdminPageHeader title={category ? 'Edit category' : 'Add category'} description='Set up the details and appearance of your collection.' />
            <div className='flex shrink-0 items-center gap-3'>
              <Button type='button' variant='outline' disabled={busy} onClick={() => router.push('/admin/categories')} className='h-11 flex-1 rounded-md px-5 sm:flex-none'>Cancel</Button>
              <Button type='submit' disabled={busy} aria-busy={busy} className='h-11 flex-1 rounded-md bg-black px-5 text-white hover:bg-gold sm:flex-none'>
                {uploading ? 'Uploading...' : busy ? 'Saving...' : 'Save category'}
              </Button>
            </div>
          </div>
          <fieldset disabled={busy} className='grid min-w-0 items-start gap-6 lg:grid-cols-3'>
            <div className='flex min-w-0 flex-col gap-6 lg:col-span-2'>
              <CategoryDetailsFields autoSlug={!category} />
              <CategoryImage onBusy={setUploading} disabled={busy} />
            </div>
            <CategoryVisibilityFields />
          </fieldset>
          {uploading && <p role='status' className='text-sm'>Uploading and validating image…</p>}
        </form>
      </FormProvider>
    </section>
  )
}
