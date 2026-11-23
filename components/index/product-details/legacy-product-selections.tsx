'use client'

import { useEffect, useMemo } from 'react'
import type { Product } from '@/components/index/shop/shop-data'
import { cn } from '@/lib/utils'
import { useProductDetailStore } from '@/stores/hooks/use-product-detail'

function Choices({ label, values, selected, onSelect }: {
  label: string
  values: string[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  if (!values.length) return null
  return (
    <div className='flex flex-col gap-3'>
      <p className='text-xs font-medium text-muted-foreground'>{label}</p>
      <div className='flex flex-wrap gap-2'>
        {values.map((value) => (
          <button key={value} type='button' onClick={() => onSelect(value)}
            className={cn('h-10 min-w-14 rounded-none border px-3 text-sm font-medium transition-colors',
              selected === value ? 'border-black bg-black text-white' : 'border-black/15 text-black hover:border-black')}>
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

export function LegacyProductSelections({ product }: { product: Product }) {
  const selectedSize = useProductDetailStore((state) => state.selectedSize)
  const setSelectedSize = useProductDetailStore((state) => state.setSelectedSize)
  const selectedColor = useProductDetailStore((state) => state.selectedColor)
  const setSelectedColor = useProductDetailStore((state) => state.setSelectedColor)
  const selectedKarat = useProductDetailStore((state) => state.selectedKarat)
  const setSelectedKarat = useProductDetailStore((state) => state.setSelectedKarat)
  const selectedWeightGrams = useProductDetailStore((state) => state.selectedWeightGrams)
  const setSelectedWeightGrams = useProductDetailStore((state) => state.setSelectedWeightGrams)
  const availableKarats = useMemo(() => product.goldKarats?.length
    ? product.goldKarats : product.goldWeightGrams ? ['18k', '22k', '24k'] : [],
  [product.goldKarats, product.goldWeightGrams])
  const weight = selectedWeightGrams ?? product.goldWeightGrams ?? 1

  useEffect(() => {
    if (availableKarats.length && !selectedKarat) setSelectedKarat(availableKarats[0])
    if (selectedWeightGrams === null) setSelectedWeightGrams(product.goldWeightGrams || 1)
  }, [availableKarats, selectedKarat, selectedWeightGrams, product.goldWeightGrams, setSelectedKarat, setSelectedWeightGrams])

  return (
    <>
      {!!(product.goldWeightGrams || product.goldKarats?.length || product.isGoldKaratPriced) && (
        <Choices label='Select gram weight' values={['0.5', '1', '1.5', '2', '2.5', '3', '5']}
          selected={String(weight)} onSelect={(value) => setSelectedWeightGrams(Number(value))} />
      )}
      <Choices label='Gold karat purity' values={availableKarats} selected={selectedKarat} onSelect={setSelectedKarat} />
      <Choices label='Size' values={product.sizes} selected={selectedSize} onSelect={setSelectedSize} />
      <Choices label='Color' values={product.colors} selected={selectedColor} onSelect={setSelectedColor} />
    </>
  )
}
