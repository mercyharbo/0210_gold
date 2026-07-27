'use client'

import {
  formatProductPrice,
  getProductLabelClassName,
} from '@/components/index/shop/shop-data'
import type { Product } from '@/components/index/shop/shop-data'
import { getEffectiveProductPrice } from '@/lib/products/gold-pricing'
import { useProductDetailStore } from '@/stores/hooks/use-product-detail'

type ProductInfoProps = {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { descriptionOpen, setDescriptionOpen, selectedKarat } = useProductDetailStore()

  const computedPrice = getEffectiveProductPrice(product, selectedKarat)

  const descriptionParagraphs = product.description.split('\n\n')
  const descriptionHasMore = descriptionParagraphs.length > 2
  const collapsedParagraphs = descriptionHasMore
    ? descriptionParagraphs.slice(0, 2)
    : descriptionParagraphs

  const visibleDescriptionParagraphs = descriptionOpen
    ? descriptionParagraphs
    : collapsedParagraphs

  const formattedLabel = product.label
    ? product.label
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : null

  return (
    <div className='flex flex-col gap-5 border-b border-black/10 pb-8'>
      {formattedLabel ? (
        <span
          className={`inline-flex w-fit px-3 py-1 text-xs font-medium ${getProductLabelClassName(
            product.label ?? ''
          )}`}
        >
          {formattedLabel}
        </span>
      ) : null}
      <div className='flex flex-col gap-3'>
        <p className='text-sm font-medium text-muted-foreground'>
          {product.category}
        </p>
        <div className='flex flex-col gap-2.5'>
          <h1 className='font-heading text-4xl font-bold leading-tight sm:text-5xl text-black'>
            {product.name}
          </h1>

          {/* Karat Badge positioned below product title */}
          {selectedKarat ? (
            <div className='flex items-center gap-2 pt-0.5'>
              <span className='inline-flex rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-white uppercase tracking-wider'>
                {selectedKarat} Gold
              </span>
              {product.goldWeightGrams && product.goldWeightGrams > 0 ? (
                <span className='text-xs font-medium text-muted-foreground'>
                  ({product.goldWeightGrams}g)
                </span>
              ) : null}
            </div>
          ) : product.goldKarats && product.goldKarats.length > 0 ? (
            <div className='flex items-center gap-2 pt-0.5'>
              <span className='inline-flex rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-white uppercase tracking-wider'>
                {product.goldKarats[0]} Gold
              </span>
              {product.goldWeightGrams && product.goldWeightGrams > 0 ? (
                <span className='text-xs font-medium text-muted-foreground'>
                  ({product.goldWeightGrams}g)
                </span>
              ) : null}
            </div>
          ) : null}

          <div className='flex flex-col gap-1 pt-1'>
            <p className='font-sans text-2xl font-bold sm:text-3xl text-black'>
              {formatProductPrice(product, computedPrice)}
            </p>
            {product.makingCharge && product.makingCharge > 0 ? (
              <p className='text-xs text-muted-foreground'>
                Includes craftsmanship & workmanship fee
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className='flex max-w-xl flex-col gap-3 text-sm leading-6 text-muted-foreground'>
        {visibleDescriptionParagraphs.map((paragraph) => (
          <p key={paragraph} className='whitespace-pre-line'>
            {paragraph}
          </p>
        ))}
        {descriptionHasMore ? (
          <button
            type='button'
            onClick={() => setDescriptionOpen(!descriptionOpen)}
            className='w-fit border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65 cursor-pointer'
          >
            {descriptionOpen ? 'Show less' : 'Read more'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
