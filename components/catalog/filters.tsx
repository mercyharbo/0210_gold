'use client'

import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { ApiFeedback } from '@/components/ui/api-feedback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useStoreCatalog } from '@/stores/hooks/use-store-catalog'
import { activeBrowseFilters, clearBrowseFilters, type BrowseQuery } from '@/lib/catalog/browse-query'
import { generalSans } from '@/lib/fonts/storefront'
import type { CatalogCategory } from '@/types/catalog'

export function CatalogFilters({ query, categories, categoriesLoadError, busy, onApply }: {
  query: BrowseQuery
  categories: CatalogCategory[]
  categoriesLoadError?: string
  busy: boolean
  onApply: (query: BrowseQuery) => void
}) {
  const { filtersOpen, setFiltersOpen } = useStoreCatalog()
  const form = useForm<BrowseQuery>({ defaultValues: query })
  const draft = useWatch({ control: form.control })

  const count = activeBrowseFilters(query)
  const draftCount = activeBrowseFilters({ q: draft.q ?? '', category: draft.category ?? '' })

  useEffect(() => {
    if (filtersOpen) {
      form.reset(query)
    }
  }, [filtersOpen, query, form])

  const handleApplyFilters = form.handleSubmit((values) => {
    onApply({ ...query, q: values.q.trim(), category: values.category, page: '1' })
    setFiltersOpen(false)
  })

  function handleClearFilters() {
    const cleared = clearBrowseFilters(query)

    form.reset(cleared)
    onApply(cleared)
    setFiltersOpen(false)
  }

  return (
    <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' disabled={busy} className='gap-2 rounded-none px-0 text-base font-medium hover:bg-transparent'>
          Filter & Sort
          {count > 0 && <span className='text-xs text-[#e10600]'>{count}</span>}
        </Button>
      </SheetTrigger>

      <SheetContent
        overlayClassName='bg-black/50 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none motion-reduce:animate-none'
        className={`${generalSans.className} gap-0 border-0 bg-white p-6 text-black shadow-none
          data-[side=right]:w-full data-[side=right]:sm:max-w-none data-[side=right]:md:max-w-[480px]
          motion-reduce:animate-none motion-reduce:transition-none`}
      >
        <SheetHeader className='p-0 pb-8'>
          <SheetTitle className='flex items-center gap-2 text-base [font-family:inherit]'>
            Filter <span className='font-normal text-gray-500'>{draftCount}</span>
          </SheetTitle>

          <SheetDescription className='sr-only'>Search or choose a collection, then apply your filters.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleApplyFilters} className='flex min-h-0 flex-1 flex-col gap-8' aria-label='Filter products'>
          <div className='flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto'>
            <Field>
              <FieldLabel htmlFor='catalog-search' className='text-sm font-normal'>Search</FieldLabel>

              <Input
                id='catalog-search'
                placeholder='Find a piece'
                maxLength={100}
                className='h-11 rounded-none border-0 bg-gray-100 text-base'
                aria-invalid={!!form.formState.errors.q}
                {...form.register('q', { maxLength: { value: 100, message: 'Use up to 100 characters.' } })}
              />

              <FieldError>{form.formState.errors.q?.message}</FieldError>
            </Field>

            <Field>
              <p id='catalog-collection-label' className='text-sm'>Collection</p>

              <ApiFeedback message={categoriesLoadError} error />

              <Controller
                control={form.control}
                name='category'
                render={({ field }) => (
                  <div role='group' aria-labelledby='catalog-collection-label' className='flex flex-wrap gap-2'>
                    {[{ slug: '', name: 'All jewellery' }, ...categories].map((category) => (
                      <Button
                        key={category.slug}
                        ref={category.slug === '' ? field.ref : undefined}
                        type='button'
                        variant='ghost'
                        aria-pressed={field.value === category.slug}
                        onClick={() => field.onChange(category.slug)}
                        className={`h-auto min-h-9 max-w-full whitespace-normal break-words rounded-none px-2 py-1 text-left text-sm font-normal
                          ${field.value === category.slug ? 'bg-black text-white hover:bg-black hover:text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                )}
              />
            </Field>
          </div>

          <div className='flex flex-col gap-2'>
            <Button type='button' disabled={busy} onClick={handleClearFilters} className='h-11 rounded-none bg-black text-white hover:bg-[#e10600]'>
              Clear filters
            </Button>

            <Button type='submit' disabled={busy} className='h-11 rounded-none bg-black text-white hover:bg-[#e10600]'>
              Show results
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
