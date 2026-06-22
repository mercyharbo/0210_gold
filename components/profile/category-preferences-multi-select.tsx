'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldDescription } from '@/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { CategoryOption } from '@/types/category'

type CategoryPreferencesMultiSelectProps = {
  categories: CategoryOption[]
  selectedCategoryIds: string[]
}

export function CategoryPreferencesMultiSelect({
  categories,
  selectedCategoryIds,
}: CategoryPreferencesMultiSelectProps) {
  const [selectedIds, setSelectedIds] = useState(selectedCategoryIds)
  const selectedCategories = useMemo(
    () => categories.filter((category) => selectedIds.includes(category.id)),
    [categories, selectedIds],
  )

  function toggleCategory(categoryId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(categoryId)
        ? currentIds.filter((id) => id !== categoryId)
        : [...currentIds, categoryId],
    )
  }

  if (categories.length === 0) {
    return (
      <div className='space-y-2'>
        <Button type='button' variant='outline' className='h-11 w-full' disabled>
          No categories available
        </Button>
        <FieldDescription>
          Categories will appear here after they are added in Supabase.
        </FieldDescription>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {selectedIds.map((categoryId) => (
        <input
          key={categoryId}
          type='hidden'
          name='preferenceCategoryIds'
          value={categoryId}
        />
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            className='h-11 w-full justify-between'
          >
            {selectedCategories.length > 0
              ? `${selectedCategories.length} selected`
              : 'Select style preferences'}
            <ChevronDown className='size-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-[min(28rem,calc(100vw-2rem))]'>
          <div className='max-h-80 space-y-1 overflow-y-auto'>
            {categories.map((category) => {
              const selected = selectedIds.includes(category.id)

              return (
                <button
                  key={category.id}
                  type='button'
                  className='flex w-full items-center gap-3 px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted'
                  onClick={() => toggleCategory(category.id)}
                >
                  <Checkbox checked={selected} aria-hidden='true' />
                  <span className='flex-1'>{category.name}</span>
                  <Check
                    className={cn(
                      'size-4 text-gold',
                      selected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 ? (
        <div className='flex flex-wrap gap-2'>
          {selectedCategories.map((category) => (
            <span
              key={category.id}
              className='bg-gold/10 px-3 py-1 text-xs font-semibold text-black'
            >
              {category.name}
            </span>
          ))}
        </div>
      ) : (
        <FieldDescription>
          Choose the categories you want us to use for recommendations.
        </FieldDescription>
      )}
    </div>
  )
}
