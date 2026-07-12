'use client'

import { Expand } from 'lucide-react'
import Image from 'next/image'

import type { Product } from '@/components/index/shop/shop-data'
import { useProductDetailStore } from '@/stores/hooks/use-product-detail'

type ProductGalleryProps = {
  product: Product
  productImages: string[]
}

export function ProductGallery({
  product,
  productImages,
}: ProductGalleryProps) {
  const { activeImageIndex, setActiveImageIndex, setGalleryOpen } =
    useProductDetailStore()
  const activeImage = productImages[activeImageIndex] ?? productImages[0]

  return (
    <div className='grid max-w-2xl gap-4 md:grid-cols-[4.25rem_1fr]'>
      <div className='hidden gap-3 md:flex md:flex-col'>
        {productImages.map((imageSrc, index) => (
          <button
            key={`${imageSrc}-${index}`}
            type='button'
            aria-label={`View ${product.name} image ${index + 1}`}
            onClick={() => setActiveImageIndex(index)}
            className={
              activeImageIndex === index
                ? 'relative aspect-square overflow-hidden border border-black bg-muted cursor-pointer'
                : 'relative aspect-square overflow-hidden border border-black/10 bg-muted transition-colors hover:border-black cursor-pointer'
            }
          >
            <Image
              src={imageSrc}
              alt={`${product.name} preview ${index + 1}`}
              fill
              sizes='4.25rem'
              unoptimized
              className='object-cover object-center'
            />
          </button>
        ))}
      </div>

      <button
        type='button'
        onClick={() => {
          setActiveImageIndex(activeImageIndex)
          setGalleryOpen(true)
        }}
        className='group relative aspect-[4/5] max-h-[44rem] overflow-hidden bg-muted text-left sm:aspect-[3/4] cursor-pointer'
      >
        <Image
          src={activeImage}
          alt={product.imageAlt}
          fill
          loading='eager'
          sizes='(min-width: 1280px) 32vw, (min-width: 1024px) 40vw, 100vw'
          unoptimized
          className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]'
        />
        <span className='absolute bottom-4 right-4 inline-flex items-center gap-2 bg-black px-3 py-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100'>
          <Expand className='size-3.5' />
          View Gallery
        </span>
      </button>

      {productImages.length > 1 ? (
        <div className='flex gap-2 overflow-x-auto md:hidden'>
          {productImages.map((imageSrc, index) => (
            <button
              key={`${imageSrc}-${index}`}
              type='button'
              aria-label={`View ${product.name} image ${index + 1}`}
              onClick={() => setActiveImageIndex(index)}
              className={
                activeImageIndex === index
                  ? 'relative size-16 shrink-0 overflow-hidden border border-black bg-muted cursor-pointer'
                  : 'relative size-16 shrink-0 overflow-hidden border border-black/10 bg-muted cursor-pointer'
              }
            >
              <Image
                src={imageSrc}
                alt={`${product.name} preview ${index + 1}`}
                fill
                sizes='4rem'
                unoptimized
                className='object-cover object-center'
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
