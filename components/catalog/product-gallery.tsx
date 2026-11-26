'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImageOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ManagedImage } from '@/types/catalog'

export function ProductGallery({ images, productName }: {
  images: ManagedImage[]
  productName: string
}) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const [imageIndex, setImageIndex] = useState(0)

  function handleSelectImage(index: number) {
    const gallery = galleryRef.current

    if (!gallery) {
      return
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gallery.scrollTo({
      left: index * gallery.clientWidth,
      behavior: reducedMotion ? 'instant' : 'smooth',
    })
  }

  return (
    <div className='flex min-w-0 flex-col gap-4'>
      <div
        role='region'
        aria-roledescription='carousel'
        aria-label={`${productName} images`}
        className='relative min-w-0'
      >
        <div
          ref={galleryRef}
          onScroll={(event) => {
            const gallery = event.currentTarget

            if (gallery.clientWidth) {
              setImageIndex(Math.round(gallery.scrollLeft / gallery.clientWidth))
            }
          }}
          className='flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain
            bg-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        >
          {images.map((image, index) => (
            <div
              key={image.media_id}
              role='group'
              aria-roledescription='slide'
              aria-label={`${index + 1} of ${images.length}`}
              className='relative aspect-[4/5] w-full shrink-0 snap-start'
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName}, view ${index + 1}`}
                fill
                priority={index === 0}
                sizes='(max-width: 1023px) 100vw, 50vw'
                className='object-cover'
              />
            </div>
          ))}

          {!images.length && (
            <div className='flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 text-gray-500'>
              <ImageOff className='size-8' strokeWidth={1} />
              <p className='text-sm'>No image available</p>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className='absolute inset-x-4 bottom-4 flex items-center justify-between gap-4'>
            <Button
              type='button'
              variant='outline'
              aria-label='Previous product image'
              disabled={imageIndex === 0}
              onClick={() => handleSelectImage(imageIndex - 1)}
              className='size-11 rounded-none border-gray-200 bg-white disabled:opacity-40'
            >
              <ArrowLeft className='size-4' />
            </Button>

            <p aria-live='polite' aria-atomic='true' className='bg-white px-3 py-2 text-xs'>
              {imageIndex + 1} / {images.length}
            </p>

            <Button
              type='button'
              variant='outline'
              aria-label='Next product image'
              disabled={imageIndex === images.length - 1}
              onClick={() => handleSelectImage(imageIndex + 1)}
              className='size-11 rounded-none border-gray-200 bg-white disabled:opacity-40'
            >
              <ArrowRight className='size-4' />
            </Button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div aria-label='Choose a product image' className='flex gap-3 overflow-x-auto pb-1'>
          {images.map((image, index) => (
            <button
              key={image.media_id}
              type='button'
              aria-label={`View product image ${index + 1}`}
              aria-pressed={imageIndex === index}
              onClick={() => handleSelectImage(index)}
              className='relative h-24 w-20 shrink-0 overflow-hidden border border-transparent
                bg-gray-100 opacity-60 transition-opacity hover:opacity-100
                aria-pressed:border-black aria-pressed:opacity-100 motion-reduce:transition-none'
            >
              <Image src={image.url} alt='' fill sizes='80px' className='object-cover' />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
