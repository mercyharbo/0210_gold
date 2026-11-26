'use client'

import { Button } from '@/components/ui/button'
import { useStoreProduct } from '@/stores/hooks/use-store-product'
import type { CatalogProduct } from '@/types/catalog'

export function ProductOptions({ product }: { product: CatalogProduct }) {
  const { productId, size, color, karat, select } = useStoreProduct()
  const isCurrentProduct = productId === product.id
  const optionGroups = [
    { label: 'Color', key: 'color', values: product.colors ?? [], selected: color },
    { label: 'Size', key: 'size', values: product.sizes ?? [], selected: size },
    { label: 'Karat', key: 'karat', values: product.gold_karats ?? [], selected: karat },
  ] as const

  if (!optionGroups.some((group) => group.values.length)) {
    return null
  }

  return (
    <div className='flex flex-col gap-5 border-t border-gray-200 pt-6'>
      {optionGroups.map((group) => group.values.length > 0 && (
        <fieldset key={group.key} className='flex min-w-0 flex-col gap-3'>
          <legend className='pb-3 text-sm font-medium'>{group.label}</legend>

          <div className='flex flex-wrap gap-2'>
            {group.values.map((value) => {
              const isSelected = isCurrentProduct && group.selected === value

              return (
                <Button
                  key={value}
                  type='button'
                  variant='outline'
                  aria-pressed={isSelected}
                  onClick={() => select({ productId: product.id, [group.key]: value })}
                  className='h-11 min-w-12 rounded-none border-gray-300 px-4 capitalize
                    hover:border-black hover:bg-gray-50 aria-pressed:border-black
                    aria-pressed:bg-black aria-pressed:text-white'
                >
                  {value}
                </Button>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
