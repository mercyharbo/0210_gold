'use client'

import Image from 'next/image'
import { useFormContext, useWatch } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useApiRequest } from '@/hooks/use-api-request'
import { useToast } from '@/stores/hooks/use-toast'
import type { UploadAuthorization } from '@/types/catalog'
import type { CategoryFormValues } from '@/lib/validations/admin-category'

export function CategoryImage({ onBusy }: { onBusy: (busy: boolean) => void }) {
  const { control, register, setValue, formState: { errors } } = useFormContext<CategoryFormValues>()
  const image = useWatch({ control, name: 'images' })[0]
  const authorize = useApiRequest<UploadAuthorization>()
  const complete = useApiRequest<{ media_id: string; url: string }>()
  const discard = useApiRequest()
  const { toast } = useToast()

  async function upload(file?: File) {
    if (!file || authorize.loading || complete.loading) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size) {
      toast('Choose a JPEG, PNG, WebP or AVIF image up to 5 MB.', 'failure')
      return
    }
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
      onBusy(false)
    }
  }

  return (
    <Card className='md:col-span-2'>
      <CardHeader>
        <CardTitle>Category image</CardTitle>
        <CardDescription>Optional single image. Image changes take effect when you save.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {image && (
            <>
              <Image src={image.url} alt={image.alt || 'Category image preview'} width={160} height={160} className='size-40 rounded-md object-cover' />
              <Field data-invalid={!!errors.images?.[0]?.alt}>
                <FieldLabel htmlFor='image-alt'>Image description</FieldLabel>
                <Input id='image-alt' {...register('images.0.alt')} aria-invalid={!!errors.images?.[0]?.alt} />
                <FieldError>{errors.images?.[0]?.alt?.message}</FieldError>
              </Field>
              <Button type='button' variant='outline' onClick={() => setValue('images', [], { shouldDirty: true })}>Remove image</Button>
            </>
          )}
          <Field data-invalid={!!errors.images}>
            <FieldLabel htmlFor='category-image'>{image ? 'Replace image' : 'Upload image'}</FieldLabel>
            <Input id='category-image' type='file' accept='image/jpeg,image/png,image/webp,image/avif' onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              void upload(file)
            }} />
            <FieldError>{errors.images?.message || errors.images?.root?.message}</FieldError>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
