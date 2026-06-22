'use client'

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  Heart,
  ShoppingBag,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductCard } from '../shop/product-card'
import {
  formatProductPrice,
  getProductLabelClassName,
  type Product,
} from '../shop/shop-data'

type ProductDetailViewProps = {
  product: Product
  relatedProducts: Product[]
}

export function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const productImages =
    product.imageUrls.length > 0 ? product.imageUrls : [product.imageSrc]
  const descriptionParagraphs = product.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const descriptionPreviewLimit = 260
  const firstDescriptionParagraph = descriptionParagraphs[0] ?? ''
  const hasLongFirstParagraph =
    firstDescriptionParagraph.length > descriptionPreviewLimit
  const descriptionHasMore =
    descriptionParagraphs.length > 1 || hasLongFirstParagraph
  const collapsedParagraphs = [
    hasLongFirstParagraph
      ? `${firstDescriptionParagraph.slice(0, descriptionPreviewLimit).trim()}...`
      : firstDescriptionParagraph,
  ].filter(Boolean)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const activeImage = productImages[activeImageIndex] ?? productImages[0]
  const visibleDescriptionParagraphs = descriptionOpen
    ? descriptionParagraphs
    : collapsedParagraphs

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? productImages.length - 1 : currentIndex - 1,
    )
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) =>
      currentIndex === productImages.length - 1 ? 0 : currentIndex + 1,
    )
  }

  function openGallery(index: number) {
    setActiveImageIndex(index)
    setGalleryOpen(true)
  }

  return (
    <div className='bg-white text-black'>
      <section>
        <div className='mx-auto w-full px-5 py-8 sm:px-8 lg:px-12 lg:py-12'>
          <Link
            href='/shop'
            className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-black'
          >
            <ArrowLeft className='size-4 stroke-[1.8]' />
            Back to shop
          </Link>

          <div className='mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,0.66fr)_minmax(0,1fr)]'>
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
                        ? 'relative aspect-square overflow-hidden border border-black bg-muted'
                        : 'relative aspect-square overflow-hidden border border-black/10 bg-muted transition-colors hover:border-black'
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
                onClick={() => openGallery(activeImageIndex)}
                className='group relative aspect-[5/4] max-h-[36rem] overflow-hidden bg-muted text-left'
              >
                <Image
                  src={activeImage}
                  alt={product.imageAlt}
                  fill
                  priority
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
                          ? 'relative size-16 shrink-0 overflow-hidden border border-black bg-muted'
                          : 'relative size-16 shrink-0 overflow-hidden border border-black/10 bg-muted'
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

            <div className='lg:sticky lg:top-28'>
              <div className='border-b border-black/10 pb-8'>
                {product.label ? (
                  <span
                    className={`mb-4 inline-flex px-3 py-1 text-[11px] font-medium uppercase ${getProductLabelClassName(product.label)}`}
                  >
                    {product.label}
                  </span>
                ) : null}
                <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
                  {product.category}
                </p>
                <h1 className='font-heading text-3xl font-bold leading-tight sm:text-4xl'>
                  {product.name}
                </h1>
                <p className='mt-4 font-heading text-xl font-semibold sm:text-2xl'>
                  {formatProductPrice(product)}
                </p>
                <div className='mt-4 flex max-w-xl flex-col gap-3 text-sm leading-6 text-muted-foreground'>
                  {visibleDescriptionParagraphs.map((paragraph) => (
                    <p key={paragraph} className='whitespace-pre-line'>
                      {paragraph}
                    </p>
                  ))}
                  {descriptionHasMore ? (
                    <button
                      type='button'
                      onClick={() => setDescriptionOpen((open) => !open)}
                      className='w-fit border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65'
                    >
                      {descriptionOpen ? 'Show Less' : 'Read More'}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className='space-y-5 border-b border-black/10 py-6'>
                <div>
                  <p className='mb-3 text-xs font-medium uppercase text-muted-foreground'>
                    Size
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type='button'
                        className='h-10 min-w-12 border border-black/15 px-4 text-sm font-medium text-black transition-colors hover:border-black focus:border-black'
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className='mb-3 text-xs font-medium uppercase text-muted-foreground'>
                    Color
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type='button'
                        className='h-10 border border-black/15 px-4 text-sm font-medium text-black transition-colors hover:border-black focus:border-black'
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='grid gap-3 border-b border-black/10 py-6 sm:grid-cols-[1fr_auto]'>
                <button
                  type='button'
                  className='inline-flex h-12 items-center justify-center gap-3 bg-black px-7 text-sm font-medium text-white transition-opacity hover:opacity-80'
                >
                  Add to cart
                  <ShoppingBag className='size-4 stroke-[1.8]' />
                </button>
                <button
                  type='button'
                  aria-label='Add to wishlist'
                  className='grid h-12 w-full place-items-center border border-black/15 text-black transition-colors hover:border-black sm:w-12'
                >
                  <Heart className='size-4 stroke-[1.8]' />
                </button>
              </div>

              <div className='space-y-4 py-6'>
                <h2 className='font-heading text-xl font-semibold'>
                  Product details
                </h2>
                <ul className='overflow-hidden border border-black/10 text-sm leading-6 text-muted-foreground'>
                  {product.details.map((detail) => (
                    <li key={detail} className='border-b border-black/10 px-4 py-3 last:border-b-0'>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className='border-t border-black/10'>
          <div className='mx-auto w-full px-5 py-16 sm:px-8 lg:px-12 lg:py-20'>
            <div className='mb-8 flex items-end justify-between gap-6'>
              <div>
                <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
                  Related
                </p>
                <h2 className='font-heading text-4xl font-bold leading-tight'>
                  You may also like
                </h2>
              </div>
              <Link
                href='/shop'
                className='hidden border-b border-black text-sm font-medium text-black transition-opacity hover:opacity-65 sm:inline-flex'
              >
                View shop
              </Link>
            </div>

            <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 min-[120rem]:grid-cols-5'>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent
          showCloseButton
          className='max-w-[calc(100vw-2rem)] gap-0 rounded-none bg-black p-0 text-white ring-0 sm:max-w-[min(92vw,72rem)]'
        >
          <DialogTitle className='sr-only'>{product.name} gallery</DialogTitle>
          <DialogDescription className='sr-only'>
            Use the previous and next buttons to view product images.
          </DialogDescription>
          <div className='relative flex min-h-[70vh] items-center justify-center'>
            <Image
              src={activeImage}
              alt={product.imageAlt}
              width={1200}
              height={900}
              unoptimized
              className='max-h-[82vh] w-auto max-w-full object-contain'
            />
            {productImages.length > 1 ? (
              <>
                <button
                  type='button'
                  aria-label='Previous image'
                  onClick={showPreviousImage}
                  className='absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20'
                >
                  <ChevronLeft className='size-5' />
                </button>
                <button
                  type='button'
                  aria-label='Next image'
                  onClick={showNextImage}
                  className='absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20'
                >
                  <ChevronRight className='size-5' />
                </button>
              </>
            ) : null}
          </div>
          {productImages.length > 1 ? (
            <div className='flex gap-2 overflow-x-auto border-t border-white/10 p-3'>
              {productImages.map((imageSrc, index) => (
                <button
                  key={`${imageSrc}-${index}`}
                  type='button'
                  aria-label={`View image ${index + 1}`}
                  onClick={() => setActiveImageIndex(index)}
                  className={
                    activeImageIndex === index
                      ? 'relative size-16 shrink-0 overflow-hidden border border-white bg-white/10'
                      : 'relative size-16 shrink-0 overflow-hidden border border-white/20 bg-white/10 opacity-70 transition-opacity hover:opacity-100'
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
