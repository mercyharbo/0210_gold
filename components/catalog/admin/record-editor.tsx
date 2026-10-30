'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSWRConfig } from 'swr'
import type { FieldPath } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/client'
import { affectedCatalogKey } from '@/lib/catalog/cache'
import {
  editorSchema,
  catalogPayload,
  draftFromRecord,
  type CatalogDraft,
  type CatalogRecord,
} from '@/lib/catalog/editor'
import { useApiRequest } from '@/hooks/use-api-request'
import type { CatalogKind } from '@/types/catalog'
import { CatalogFeedback } from '../feedback'
import { ProductFields, CategoryFields, BannerFields } from './product-fields'
import { MediaEditor } from './media-editor'

export function CatalogRecordEditor({ kind, record }: { kind: CatalogKind; record?: CatalogRecord }) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [uploadBusy, setUploadBusy] = useState(false)
  const form = useForm<CatalogDraft>({
    resolver: zodResolver(editorSchema(kind)),
    defaultValues: draftFromRecord(record),
  })
  const { execute, loading, error } = useApiRequest()
  const target = kind === 'banners' ? 'hero-banners' : kind
  const submit = form.handleSubmit(async (values) => {
    if (uploadBusy) return
    form.clearErrors('root')
    try {
      const endpoint = `/admin/${kind}${record ? `/${record.id}` : ''}`
      await execute(record ? 'put' : 'post', endpoint, catalogPayload(kind, values))
    } catch (failure) {
      if (failure instanceof ApiError && failure.fieldErrors) {
        let focus = true
        for (const [field, messages] of Object.entries(failure.fieldErrors)) {
          const first = field.split('.')[0]
          const path = field.startsWith('images.')
            ? (field as FieldPath<CatalogDraft>)
            : first in values
              ? (first as FieldPath<CatalogDraft>)
              : 'root'
          form.setError(path, { message: messages.join(' ') }, { shouldFocus: focus })
          focus = false
        }
      }
      return
    }
    // A failed refresh never repeats an already-successful write.
    try {
      await mutate((key) => affectedCatalogKey(key, kind))
    } catch {
      /* Destination exposes refresh failures. */
    }
    router.push(`/admin/${target}`)
    router.refresh()
  })
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {record ? 'Edit' : 'Create'}{' '}
        {kind === 'categories' ? 'category' : kind === 'banners' ? 'banner' : 'product'}
      </h1>
      <FormProvider {...form}>
        <form
          onSubmit={submit}
          noValidate
          className="flex flex-col gap-6 rounded-md border bg-white p-5 sm:p-8"
        >
          <fieldset disabled={loading} className="flex min-w-0 flex-col gap-6">
            {kind === 'products' ? (
              <ProductFields />
            ) : kind === 'categories' ? (
              <CategoryFields />
            ) : (
              <BannerFields />
            )}
            <MediaEditor kind={kind} onBusy={setUploadBusy} />
          </fieldset>
          <CatalogFeedback message={form.formState.errors.root?.message || error?.message} error />
          <Button disabled={loading || uploadBusy || form.formState.isSubmitting}>
            {loading ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}
