'use client'

import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

import { formatProductPrice } from '@/components/index/shop/shop-data'
import type { Product } from '@/components/index/shop/shop-data'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useProductDetailStore } from '@/stores/hooks/use-product-detail'
import { ProductGallery } from './product-gallery'
import { ProductInfo } from './product-info'
import { ProductOptions } from './product-options'
import { ProductReviews } from './product-reviews'
import type { StorefrontReview } from '@/lib/reviews/storefront-reviews'

type ProductDetailViewProps = {
  product: Product
  relatedProducts: Product[]
  initiallyWishlisted?: boolean
  approvedReviews?: StorefrontReview[]
}

export function ProductDetailView({
  product,
  relatedProducts,
  initiallyWishlisted = false,
  approvedReviews = [],
}: ProductDetailViewProps) {
  const productImages =
    product.imageUrls.length > 0 ? product.imageUrls : [product.imageSrc]

  // Retrieve state and setters from Zustand store
  const {
    activeImageIndex,
    setActiveImageIndex,
    galleryOpen,
    setGalleryOpen,
    setSelectedSize,
    setSelectedColor,
    setIsWishlisted,
    resetStore,
  } = useProductDetailStore()

  // Initialize store values on mount/update
  useEffect(() => {
    setIsWishlisted(initiallyWishlisted)
    setSelectedSize(product.sizes[0] || null)
    setSelectedColor(product.colors[0] || null)

    return () => {
      resetStore()
    }
  }, [
    product,
    initiallyWishlisted,
    setIsWishlisted,
    setSelectedSize,
    setSelectedColor,
    resetStore,
  ])

  const activeImage = productImages[activeImageIndex] ?? productImages[0]

  function showPreviousImage() {
    setActiveImageIndex(
      activeImageIndex === 0 ? productImages.length - 1 : activeImageIndex - 1
    )
  }

  function showNextImage() {
    setActiveImageIndex(
      activeImageIndex === productImages.length - 1 ? 0 : activeImageIndex + 1
    )
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

          <div className='grid gap-10 pt-6 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,0.66fr)_minmax(0,1fr)]'>
            {/* Left Column: Product Gallery */}
            <ProductGallery product={product} productImages={productImages} />

            {/* Right Column: Info and Options */}
            <div className='lg:sticky lg:top-28'>
              <ProductInfo product={product} />

              <ProductOptions product={product} />

              {/* Product Specifications */}
              <div className='flex flex-col gap-4 py-6'>
                <h2 className='font-heading text-xl font-semibold text-black'>
                  Specifications
                </h2>
                <ul className='overflow-hidden border border-black/10 text-sm leading-6 text-muted-foreground'>
                  {product.details.map((detail) => (
                    <li
                      key={detail}
                      className='border-b border-black/10 px-4 py-3 last:border-b-0'
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product Customer Reviews */}
              <ProductReviews
                productId={product.id}
                productSlug={product.slug}
                initialReviews={approvedReviews}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className='border-t border-black/10 px-5 py-16 sm:px-8 lg:px-12 lg:py-24'>
          <div className='mx-auto max-w-7xl space-y-10 sm:space-y-14'>
            <h2 className='text-center font-heading text-4xl font-bold sm:text-5xl text-black'>
              You may also like
            </h2>
            <div className='grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4'>
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className='group flex flex-col gap-4'
                >
                  <div className='relative aspect-[3/4] overflow-hidden bg-muted'>
                    <Image
                      src={relatedProduct.imageSrc}
                      alt={relatedProduct.imageAlt}
                      fill
                      sizes='(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 90vw'
                      unoptimized
                      className='object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]'
                    />
                  </div>
                  <div className='flex flex-col gap-1 items-start text-left'>
                    <h3 className='font-heading text-lg font-semibold text-black transition-opacity group-hover:opacity-65'>
                      {relatedProduct.name}
                    </h3>
                    <p className='text-sm font-semibold text-black/70'>
                      {formatProductPrice(relatedProduct)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fullscreen Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className='relative flex h-full max-h-none w-full max-w-none flex-col justify-between overflow-y-auto rounded-none border-none bg-black/95 p-0 text-white'>
          <button
            type='button'
            aria-label='Close gallery'
            onClick={() => setGalleryOpen(false)}
            className='absolute right-4 top-4 z-50 grid size-10 place-items-center bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 cursor-pointer'
          >
            <X className='size-5' />
          </button>
          <div className='relative flex flex-1 items-center justify-center p-4'>
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
                  className='absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 cursor-pointer'
                >
                  <ChevronLeft className='size-5' />
                </button>
                <button
                  type='button'
                  aria-label='Next image'
                  onClick={showNextImage}
                  className='absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 cursor-pointer'
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
                      ? 'relative size-16 shrink-0 overflow-hidden border border-white bg-white/10 cursor-pointer'
                      : 'relative size-16 shrink-0 overflow-hidden border border-white/20 bg-white/10 opacity-70 transition-opacity hover:opacity-100 cursor-pointer'
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
