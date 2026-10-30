'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useApiRequest } from '@/hooks/use-api-request'
import type { CatalogDraft } from '@/lib/catalog/editor'
import type { CatalogKind, UploadAuthorization } from '@/types/catalog'
import { CatalogFeedback } from '../feedback'

export function MediaEditor({ kind, onBusy }: { kind: CatalogKind; onBusy: (busy: boolean) => void }) {
  const form = useFormContext<CatalogDraft>()
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'images' })
  const authorize = useApiRequest<UploadAuthorization>()
  const complete = useApiRequest<{ media_id: string; url: string }>()
  const discard = useApiRequest<{ deleted: boolean }>()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const maxCount = kind === 'products' ? 8 : 1
  async function upload(file?: File) {
    if (!file || uploading) return
    const limit = (kind === 'banners' ? 8 : 5) * 1024 * 1024
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > limit) {
      setUploadError(`Choose a JPEG, PNG, WebP or AVIF image up to ${limit / 1024 / 1024} MB.`)
      return
    }
    setUploading(true)
    onBusy(true)
    setUploadError('')
    let pendingId: string | undefined
    try {
      const response = await authorize.execute('post', '/admin/media/uploads', {
        kind: kind === 'products' ? 'product' : kind === 'categories' ? 'category' : 'banner',
        content_type: file.type,
        size: file.size,
      })
      const authorization = response.data
      if (!authorization) throw new Error('Upload authorization was not returned.')
      pendingId = authorization.media_id
      // Protocol exception: raw file goes directly to the short-lived storage URL, never through Next.js.
      const result = await fetch(authorization.upload_url, {
        method: 'PUT',
        headers: authorization.headers,
        body: file,
      })
      if (!result.ok) throw new Error('Image upload failed. Your current images have been preserved.')
      const confirmed = await complete.execute('post', `/admin/media/${authorization.media_id}/complete`, {})
      if (!confirmed.data) throw new Error('Image completion could not be confirmed.')
      append({ media_id: confirmed.data.media_id, url: confirmed.data.url, alt: '' })
      pendingId = undefined
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Image upload failed.')
      if (pendingId) {
        try {
          await discard.execute('delete', `/admin/media/${pendingId}`)
        } catch {
          /* Cleanup can retry later. */
        }
      }
    } finally {
      setUploading(false)
      onBusy(false)
    }
  }
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="py-3 text-lg font-medium">Images</legend>
      <p className="text-sm text-gray-600">
        Changes are applied when you save. Upload replacements before removing current images.
      </p>
      <CatalogFeedback message={uploadError} error />
      <FieldError>{form.formState.errors.images?.message}</FieldError>
      {fields.map((image, index) => (
        <div key={image.id} className="flex flex-col gap-3 rounded-md border p-4">
          <div className="relative size-24">
            <Image
              src={image.url}
              alt={image.alt || 'Image awaiting alt text'}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <Field data-invalid={!!form.formState.errors.images?.[index]?.alt}>
            <FieldLabel htmlFor={`image-alt-${index}`}>Image {index + 1} description</FieldLabel>
            <Input
              id={`image-alt-${index}`}
              {...form.register(`images.${index}.alt`)}
              aria-invalid={!!form.formState.errors.images?.[index]?.alt}
            />
            <FieldError>{form.formState.errors.images?.[index]?.alt?.message}</FieldError>
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={index === 0 || uploading}
              onClick={() => move(index, index - 1)}
            >
              Move earlier
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={index === fields.length - 1 || uploading}
              onClick={() => move(index, index + 1)}
            >
              Move later
            </Button>
            <Button type="button" variant="outline" disabled={uploading} onClick={() => remove(index)}>
              Remove from record
            </Button>
          </div>
        </div>
      ))}
      <Field>
        <FieldLabel htmlFor="catalog-file">
          Upload image ({fields.length}/{maxCount})
        </FieldLabel>
        <Input
          id="catalog-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading || fields.length >= maxCount}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void upload(file)
          }}
        />
      </Field>
      {uploading && (
        <p role="status" className="text-sm">
          Uploading and checking image…
        </p>
      )}
    </fieldset>
  )
}
