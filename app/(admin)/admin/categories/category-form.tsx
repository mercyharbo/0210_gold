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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { categoryTypeOptions } from '@/lib/categories/category-options'
import type { AdminCategory } from '@/types/category'
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionResult,
} from './actions'

type CategoryFormProps = {
  category?: AdminCategory
  mode: 'create' | 'edit'
}

function CategoryToast({
  onDismiss,
  result,
}: {
  onDismiss: () => void
  result: CategoryActionResult
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

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const [result, setResult] = useState<CategoryActionResult>(null)
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(category?.is_active ?? true)
  const [isFeatured, setIsFeatured] = useState(category?.is_featured ?? false)
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null)
  const toast = result?.id === dismissedToastId ? null : result
  const isEdit = mode === 'edit' && category

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
          ? await updateCategoryAction(category.id, null, formData)
          : await createCategoryAction(null, formData),
      )
    })
  }

  function handleDelete() {
    if (!isEdit || category.product_count > 0) {
      return
    }

    const formData = new FormData()
    formData.set('categoryId', category.id)

    startTransition(async () => {
      await deleteCategoryAction(formData)
    })
  }

  return (
    <>
      <CategoryToast
        result={toast}
        onDismiss={() => toast && setDismissedToastId(toast.id)}
      />

      <form onSubmit={handleSubmit} className='grid gap-6 md:grid-cols-3'>
        <input type='hidden' name='isActive' value={isActive ? 'true' : 'false'} />
        <input
          type='hidden'
          name='isFeatured'
          value={isFeatured ? 'true' : 'false'}
        />

        <div className='flex flex-col gap-6 md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Category Details
              </CardTitle>
              <CardDescription className='text-sm'>
                Manage the catalog category and storefront card copy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field>
                    <FieldLabel htmlFor='name'>Title</FieldLabel>
                    <Input
                      id='name'
                      name='name'
                      required
                      defaultValue={category?.name}
                      className='h-11'
                      placeholder='Jewellery & Accessories'
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='slug'>Slug</FieldLabel>
                    <Input
                      id='slug'
                      name='slug'
                      required
                      defaultValue={category?.slug}
                      className='h-11'
                      placeholder='jewellery-accessories'
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    name='categoryType'
                    defaultValue={category?.category_type ?? 'Fashion'}
                    required
                  >
                    <SelectTrigger size='lg' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor='description'>Description</FieldLabel>
                  <Textarea
                    id='description'
                    name='description'
                    rows={5}
                    defaultValue={category?.description ?? ''}
                    placeholder='Gold pieces and finishing details grouped together for polished everyday styling.'
                  />
                  <FieldDescription>
                    Featured categories use this text on the public collection
                    card.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-sans text-base font-semibold'>
                Storefront Visibility
              </CardTitle>
              <CardDescription className='text-sm'>
                Active categories can be used publicly. Featured categories also
                appear as collection cards.
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
                        Active category
                      </span>
                      <span className='text-sm leading-6 text-muted-foreground'>
                        Show this category in product filters and public reads.
                      </span>
                    </span>
                  </label>

                  <label className='flex items-start gap-3 rounded-lg border border-border p-4'>
                    <Checkbox
                      checked={isFeatured}
                      onCheckedChange={(checked) =>
                        setIsFeatured(checked === true)
                      }
                      className='translate-y-0.5'
                    />
                    <span className='flex flex-col gap-1'>
                      <span className='text-sm font-medium text-foreground'>
                        Featured collection card
                      </span>
                      <span className='text-sm leading-6 text-muted-foreground'>
                        Use this category on the storefront collection carousel.
                      </span>
                    </span>
                  </label>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <Field>
                    <FieldLabel htmlFor='sortOrder'>Sort Order</FieldLabel>
                    <Input
                      id='sortOrder'
                      name='sortOrder'
                      type='number'
                      min='0'
                      defaultValue={category?.sort_order ?? 0}
                      className='h-11'
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='featuredSortOrder'>
                      Featured Sort Order
                    </FieldLabel>
                    <Input
                      id='featuredSortOrder'
                      name='featuredSortOrder'
                      type='number'
                      min='0'
                      defaultValue={category?.featured_sort_order ?? 0}
                      className='h-11'
                    />
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
                Image
              </CardTitle>
              <CardDescription className='text-sm'>
                Upload the image used for featured collection cards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {category?.image_src ? (
                  <div className='overflow-hidden rounded-lg border border-border bg-muted'>
                    <Image
                      src={category.image_src}
                      alt={category.image_alt ?? category.name}
                      width={640}
                      height={800}
                      unoptimized={category.image_src.startsWith('http')}
                      className='aspect-[4/5] w-full object-cover'
                    />
                  </div>
                ) : (
                  <div className='grid aspect-[4/5] place-items-center rounded-lg border border-dashed border-border bg-muted text-center text-sm text-muted-foreground'>
                    No image uploaded
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor='imageFile'>
                    {category?.image_src ? 'Replace Image' : 'Image Upload'}
                  </FieldLabel>
                  <Input
                    id='imageFile'
                    name='imageFile'
                    type='file'
                    accept='image/avif,image/jpeg,image/png,image/webp'
                    className='h-11'
                  />
                  <FieldDescription>
                    Upload AVIF, JPEG, PNG, or WebP. Required when the category
                    is featured.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor='imageAlt'>Image Alt Text</FieldLabel>
                  <Textarea
                    id='imageAlt'
                    name='imageAlt'
                    rows={3}
                    defaultValue={category?.image_alt ?? ''}
                    placeholder='Gold jewellery and accessories styled as a premium flat lay'
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
                Save changes or leave this category unchanged.
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
                  {isPending
                    ? isEdit
                      ? 'Saving Category'
                      : 'Creating Category'
                    : isEdit
                      ? 'Save Category'
                      : 'Create Category'}
                </Button>
                <Button asChild variant='outline'>
                  <Link href='/admin/categories'>Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {isEdit ? (
            <Card className='border-destructive/30'>
              <CardHeader>
                <CardTitle className='font-sans text-base font-semibold text-destructive'>
                  Delete Category
                </CardTitle>
                <CardDescription className='text-sm'>
                  Categories with products cannot be deleted.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col gap-3'>
                  <Button
                    type='button'
                    variant='destructive'
                    disabled={category.product_count > 0 || isPending}
                    className='w-full justify-center'
                    onClick={handleDelete}
                  >
                    <Trash2 className='size-4' />
                    Delete Category
                  </Button>
                  {category.product_count > 0 ? (
                    <p className='text-sm leading-6 text-muted-foreground'>
                      Move {category.product_count} product
                      {category.product_count === 1 ? '' : 's'} out of this
                      category before deleting it.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </form>
    </>
  )
}
