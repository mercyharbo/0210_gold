'use client'

import {
  formatProductPrice,
  getProductLabelClassName,
} from '@/components/index/shop/shop-data'
import type { Product } from '@/components/index/shop/shop-data'
import { useProductDetailStore } from '@/stores/hooks/use-product-detail'

type ProductInfoProps = {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { descriptionOpen, setDescriptionOpen } = useProductDetailStore()

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
        <div className='flex flex-col gap-2'>
          <h1 className='font-heading text-4xl font-bold leading-tight sm:text-5xl text-black'>
            {product.name}
          </h1>
          <p className='font-heading text-2xl font-semibold sm:text-3xl text-black'>
            {formatProductPrice(product)}
          </p>
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
