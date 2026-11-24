'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApiRequest } from '@/hooks/use-api-request'
import { useToast } from '@/stores/hooks/use-toast'
import type { UploadAuthorization } from '@/types/catalog'
import type { CategoryFormValues } from '@/lib/validations/admin-category'
import { ImageDropzone } from './image-dropzone'

export function CategoryImage({ onBusy, disabled }: { onBusy: (busy: boolean) => void; disabled: boolean }) {
  const { control, register, setValue, formState: { errors } } = useFormContext<CategoryFormValues>()
  const image = useWatch({ control, name: 'images' })[0]
  const authorize = useApiRequest<UploadAuthorization>()
  const complete = useApiRequest<{ media_id: string; url: string }>()
  const discard = useApiRequest()
  const { toast } = useToast()
  const uploading = useRef(false)

  async function upload(file?: File) {
    if (!file || disabled || uploading.current) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size) {
      toast('Choose a JPEG, PNG, WebP or AVIF image up to 5 MB.', 'failure')
      return
    }
    uploading.current = true
    onBusy(true)
    let pendingId: string | undefined
    try {
      const response = await authorize.execute('post', '/admin/media/uploads', {
        kind: 'category', content_type: file.type, size: file.size,
      })
      if (!response.data) throw new Error('Upload authorization was not returned.')
      pendingId = response.data.media_id
      // Storage protocol exception: send the raw file directly to its short-lived URL.
      const uploaded = await fetch(response.data.upload_url, {
        method: 'PUT', headers: response.data.headers, body: file,
      })
      if (!uploaded.ok) throw new Error('Image upload failed. Your existing image is unchanged.')
      const confirmed = await complete.execute('post', `/admin/media/${pendingId}/complete`)
      if (!confirmed.data) throw new Error('Image validation could not be confirmed.')
      // Replace the draft only after storage validation succeeds; saving attaches it.
      setValue('images', [{ ...confirmed.data, alt: image?.alt ?? '' }], { shouldDirty: true })
      pendingId = undefined
      toast(confirmed.message || 'Image uploaded. Save the category to apply it.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Image upload failed.', 'failure')
      if (pendingId) {
        try { await discard.execute('delete', `/admin/media/${pendingId}`) } catch { /* Backend cleanup retries abandoned uploads. */ }
      }
    } finally {
      uploading.current = false
      onBusy(false)
    }
  }

  return (
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'>
        <CardTitle><h2 className='font-sans text-base font-semibold'>Category image</h2></CardTitle>
        <CardDescription>Optional single image. Image changes take effect when you save.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className='gap-4'>
          {image && (
            <div className='flex items-start gap-3 rounded-md border border-border bg-gray-50 p-3'>
              <Image src={image.url} alt={image.alt || 'Category image preview'} width={80} height={80} className='size-16 shrink-0 rounded-md object-cover sm:size-20' />
              <Field className='min-w-0 flex-1' data-invalid={!!errors.images?.[0]?.alt}>
                <FieldLabel htmlFor='image-alt'>Image description</FieldLabel>
                <Input id='image-alt' className='h-10 rounded-md bg-white' {...register('images.0.alt')} aria-invalid={!!errors.images?.[0]?.alt} />
                <FieldError>{errors.images?.[0]?.alt?.message}</FieldError>
              </Field>
              <Button type='button' variant='ghost' size='icon-sm' aria-label='Remove image' onClick={() => setValue('images', [], { shouldDirty: true })}><Trash2 className='size-4' /></Button>
            </div>
          )}
          <Field data-invalid={!!errors.images}>
            <FieldLabel htmlFor='category-image' className='sr-only'>{image ? 'Replace image' : 'Upload image'}</FieldLabel>
            <ImageDropzone disabled={disabled} replacing={!!image} invalid={!!errors.images} onSelect={(files) => {
              if (!files?.length) return
              if (files.length > 1) { toast('Choose one category image at a time.', 'failure'); return }
              void upload(files[0])
            }} />
            <FieldError>{errors.images?.message || errors.images?.root?.message}</FieldError>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
