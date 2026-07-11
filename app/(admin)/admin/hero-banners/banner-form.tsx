'use client'

import { Save, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type FormEvent, useEffect, useState, useTransition } from 'react'

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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { HeroBanner } from '@/types/hero-banner'
import {
  createHeroBannerAction,
  deleteHeroBannerAction,
  updateHeroBannerAction,
  type BannerActionResult,
} from './actions'

type BannerFormProps = {
  banner?: HeroBanner | null
  mode: 'create' | 'edit'
}

function BannerToast({
  onDismiss,
  result,
}: {
  onDismiss: () => void
  result: BannerActionResult
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

export function BannerForm({ banner, mode }: BannerFormProps) {
  const [result, setResult] = useState<BannerActionResult>(null)
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(banner?.is_active ?? true)
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null)
  const toast = result?.id === dismissedToastId ? null : result
  const isEdit = mode === 'edit' && banner

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
      setResult(
        isEdit
          ? await updateHeroBannerAction(banner.id, null, formData)
          : await createHeroBannerAction(null, formData),
      )
    })
  }

  function handleDelete() {
    if (!isEdit) {
      return
    }

    const formData = new FormData()
    formData.set('bannerId', banner.id)

    startTransition(async () => {
      await deleteHeroBannerAction(formData)
    })
  }

  return (
    <>
      <BannerToast
        result={toast}
        onDismiss={() => toast && setDismissedToastId(toast.id)}
      />

      <form onSubmit={handleSubmit} className='grid gap-6 md:grid-cols-3'>
        <input type='hidden' name='isActive' value={isActive ? 'true' : 'false'} />
        {isEdit && <input type='hidden' name='existingImageSrc' value={banner.image_src} />}

        <div className='flex flex-col gap-6 md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Banner Details
              </CardTitle>
              <CardDescription className='text-sm'>
                Manage the title, description, and link destination for this slideshow banner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor='title'>Title</FieldLabel>
                  <Input
                    id='title'
                    name='title'
                    required
                    defaultValue={banner?.title}
                    className='h-11'
                    placeholder='E.g. Gold that defines you'
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor='description'>Description</FieldLabel>
                  <Textarea
                    id='description'
                    name='description'
                    required
                    rows={4}
                    defaultValue={banner?.description ?? ''}
                    placeholder='E.g. Timeless gold jewellery crafted for every moment.'
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor='route'>Route (URL Link)</FieldLabel>
                  <Input
                    id='route'
                    name='route'
                    required
                    defaultValue={banner?.route ?? '/shop'}
                    className='h-11'
                    placeholder='E.g. /shop or /categories/gold'
                  />
                  <FieldDescription>
                    Where the button should redirect users on the store.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Storefront Visibility & Order
              </CardTitle>
              <CardDescription className='text-sm'>
                Active banners appear in the homepage slider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid gap-4 md:grid-cols-2'>
                  <label className='flex items-start gap-3 rounded-lg border border-border p-4'>
                    <Checkbox
                      checked={isActive}
                      onCheckedChange={(checked) => setIsActive(checked === true)}
                      className='translate-y-0.5'
                    />
                    <span className='flex flex-col gap-1'>
                      <span className='text-sm font-medium text-foreground'>
                        Active banner
                      </span>
                      <span className='text-sm leading-6 text-muted-foreground'>
                        Show this banner in the homepage slideshow.
                      </span>
                    </span>
                  </label>

                  <Field>
                    <FieldLabel htmlFor='sortOrder'>Sort Order</FieldLabel>
                    <Input
                      id='sortOrder'
                      name='sortOrder'
                      type='number'
                      min='0'
                      defaultValue={banner?.sort_order ?? 0}
                      className='h-11'
                    />
                    <FieldDescription>
                      Banners are ordered lowest to highest.
                    </FieldDescription>
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Banner Image
              </CardTitle>
              <CardDescription className='text-sm'>
                Upload the widescreen image used for the homepage slide.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {banner?.image_src ? (
                  <div className='overflow-hidden rounded-lg border border-border bg-muted'>
                    <Image
                      src={banner.image_src}
                      alt={banner.title}
                      width={800}
                      height={450}
                      unoptimized={banner.image_src.startsWith('http')}
                      className='aspect-[16/9] w-full object-cover'
                    />
                  </div>
                ) : (
                  <div className='grid aspect-[16/9] place-items-center rounded-lg border border-dashed border-border bg-muted text-center text-sm text-muted-foreground'>
                    No image uploaded
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor='imageFile'>
                    {banner?.image_src ? 'Replace Image' : 'Image Upload'}
                  </FieldLabel>
                  <Input
                    id='imageFile'
                    name='imageFile'
                    type='file'
                    accept='image/avif,image/jpeg,image/png,image/webp'
                    className='h-11'
                    required={!isEdit}
                  />
                  <FieldDescription>
                    Upload widescreen ratio AVIF, JPEG, PNG, or WebP.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <Button type='submit' className='h-11 w-full gap-2' disabled={isPending}>
                {isPending ? (
                  <Spinner className='size-4' />
                ) : (
                  <Save className='size-4' />
                )}
                Save Banner
              </Button>

              {isEdit && (
                <Button
                  type='button'
                  variant='outline'
                  className='h-11 w-full gap-2 border-destructive text-destructive hover:bg-destructive/10'
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  <Trash2 className='size-4' />
                  Delete Banner
                </Button>
              )}

              <Button asChild variant='ghost' className='h-11 w-full' disabled={isPending}>
                <Link href='/admin/hero-banners'>Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  )
}
