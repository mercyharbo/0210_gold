'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { ArrowDown, ArrowUp, RefreshCw, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ImageDropzone } from '@/components/admin/media/image-dropzone'
import { useApiRequest } from '@/hooks/use-api-request'
import { useToast } from '@/stores/hooks/use-toast'
import { productImageAccept, validateProductImages } from '@/lib/products/media'
import type { ProductFormValues } from '@/lib/validations/admin-product'
import type { UploadAuthorization } from '@/types/catalog'

export function ProductImages({ disabled, onBusy }: { disabled: boolean; onBusy: (busy: boolean) => void }) {
  const form = useFormContext<ProductFormValues>()
  const images = useWatch({ control: form.control, name: 'images' })
  const { fields, append, update, remove, move } = useFieldArray({ control: form.control, name: 'images' })
  const authorize = useApiRequest<UploadAuthorization>()
  const complete = useApiRequest<{ media_id: string; url: string }>()
  const discard = useApiRequest()
  const { toast } = useToast()
  const uploading = useRef(false)
  const replacementInput = useRef<HTMLInputElement>(null)
  const replacementIndex = useRef<number | null>(null)

  async function handleUploadProductImages(selected: FileList | null, replaceIndex?: number) {
    if (!selected?.length || disabled || uploading.current) return
    const files = Array.from(selected)
    try { validateProductImages(files, images.length, replaceIndex !== undefined) }
    catch (error) { toast(error instanceof Error ? error.message : 'Choose valid images.', 'failure'); return }
    uploading.current = true
    onBusy(true)
    try {
      // Sequential requests preserve ordering and each useApiRequest instance's lifecycle.
      for (const file of files) {
        let pendingId: string | undefined
        try {
          const response = await authorize.execute('post', '/admin/media/uploads', {
            kind: 'product', content_type: file.type, size: file.size,
          })
          if (!response.data) throw new Error('Upload authorization was not returned.')
          pendingId = response.data.media_id
          // Direct-storage exception: the raw file goes only to its short-lived presigned URL.
          const uploaded = await fetch(response.data.upload_url, { method: 'PUT', headers: response.data.headers, body: file })
          if (!uploaded.ok) throw new Error('Image upload failed. Existing images are unchanged.')
          const confirmed = await complete.execute('post', `/admin/media/${pendingId}/complete`)
          if (!confirmed.data) throw new Error('Image validation could not be confirmed.')
          const image = { ...confirmed.data, alt: replaceIndex === undefined ? '' : images[replaceIndex].alt }
          if (replaceIndex === undefined) append(image, { shouldFocus: false })
          else update(replaceIndex, image)
          pendingId = undefined
        } catch (error) {
          if (pendingId) {
            try { await discard.execute('delete', `/admin/media/${pendingId}`) } catch { /* Safe backend cleanup retries unused uploads. */ }
          }
          throw error
        }
      }
      toast('Images uploaded. Save the product to apply your changes.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to upload images.', 'failure')
    } finally {
      uploading.current = false
      onBusy(false)
    }
  }

  return (
    <Card className='gap-5 rounded-lg border border-border shadow-none ring-0'>
      <CardHeader className='border-b border-border pb-4'>
        <CardTitle><h2 className='font-sans text-base font-semibold'>Product images</h2></CardTitle>
        <CardDescription>The first image is primary. Changes apply only when you save.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className='gap-4'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex flex-col gap-3 rounded-md border border-border bg-gray-50 p-3'>
              <div className='flex items-start gap-3'>
                <Image src={field.url} alt={images[index]?.alt || `Product image ${index + 1} preview`} width={80} height={80} className='size-16 shrink-0 rounded-md object-cover sm:size-20' />
                <Field className='min-w-0 flex-1' data-invalid={!!form.formState.errors.images?.[index]?.alt}>
                  <FieldLabel htmlFor={`product-image-alt-${index}`}>{index === 0 ? 'Primary image description' : `Image ${index + 1} description`}</FieldLabel>
                  <Input id={`product-image-alt-${index}`} className='h-10 rounded-md bg-white' {...form.register(`images.${index}.alt`)} aria-invalid={!!form.formState.errors.images?.[index]?.alt} />
                  <FieldError>{form.formState.errors.images?.[index]?.alt?.message}</FieldError>
                </Field>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Button type='button' size='sm' variant='outline' disabled={disabled} onClick={() => { replacementIndex.current = index; replacementInput.current?.click() }}><RefreshCw className='size-4' />Replace<span className='sr-only'> image {index + 1}</span></Button>
                <Button type='button' size='icon-sm' variant='ghost' disabled={disabled || index === 0} aria-label={`Move image ${index + 1} earlier`} onClick={() => move(index, index - 1)}><ArrowUp className='size-4' /></Button>
                <Button type='button' size='icon-sm' variant='ghost' disabled={disabled || index === fields.length - 1} aria-label={`Move image ${index + 1} later`} onClick={() => move(index, index + 1)}><ArrowDown className='size-4' /></Button>
                <Button type='button' size='icon-sm' variant='ghost' disabled={disabled} aria-label={`Remove image ${index + 1}`} onClick={() => remove(index)}><Trash2 className='size-4' /></Button>
              </div>
            </div>
          ))}
          <ImageDropzone inputId='product-images' multiple disabled={disabled || fields.length >= 8} replacing={false} invalid={!!form.formState.errors.images}
            onSelect={(files) => { void handleUploadProductImages(files) }} />
          <FieldError>{form.formState.errors.images?.message || form.formState.errors.images?.root?.message}</FieldError>
          <Input ref={replacementInput} type='file' className='hidden' accept={productImageAccept} disabled={disabled} aria-label='Choose replacement product image' onChange={(event) => {
            const index = replacementIndex.current
            if (index !== null) void handleUploadProductImages(event.target.files, index)
            replacementIndex.current = null
            event.target.value = ''
          }} />
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
