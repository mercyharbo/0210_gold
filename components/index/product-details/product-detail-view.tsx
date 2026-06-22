import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ProductCard } from '../shop/product-card'
import {
  formatNaira,
  getRelatedProducts,
  type Product,
} from '../shop/shop-data'

type ProductDetailViewProps = {
  product: Product
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const relatedProducts = getRelatedProducts(product)

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

          <div className='mt-8 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start'>
            <div className='grid gap-4 md:grid-cols-[5rem_1fr]'>
              <div className='hidden gap-3 md:flex md:flex-col'>
                {[product.imageSrc, product.imageSrc, product.imageSrc].map(
                  (imageSrc, index) => (
                    <div
                      key={`${imageSrc}-${index}`}
                      className='relative aspect-square overflow-hidden bg-muted'
                    >
                      <Image
                        src={imageSrc}
                        alt={`${product.name} preview ${index + 1}`}
                        fill
                        sizes='5rem'
                        className='object-cover object-center'
                      />
                    </div>
                  ),
                )}
              </div>

              <div className='relative aspect-[4/5] overflow-hidden bg-muted'>
                <Image
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  fill
                  priority
                  sizes='(min-width: 1024px) 54vw, 100vw'
                  className='object-cover object-center'
                />
              </div>
            </div>

            <div className='lg:sticky lg:top-28'>
              <div className='border-b border-black/10 pb-8'>
                {product.label ? (
                  <p className='mb-4 text-xs font-medium uppercase text-muted-foreground'>
                    {product.label}
                  </p>
                ) : null}
                <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
                  {product.category}
                </p>
                <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl'>
                  {product.name}
                </h1>
                <p className='mt-5 font-heading text-3xl font-semibold'>
                  {formatNaira(product.price)}
                </p>
                <p className='mt-5 max-w-xl text-base leading-7 text-muted-foreground'>
                  {product.description}
                </p>
              </div>

              <div className='space-y-7 border-b border-black/10 py-8'>
                <div>
                  <p className='mb-3 text-xs font-medium uppercase text-muted-foreground'>
                    Size
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type='button'
                        className='h-10 min-w-12 border border-black/15 px-4 text-sm font-medium text-black transition-colors hover:border-black'
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
                        className='h-10 border border-black/15 px-4 text-sm font-medium text-black transition-colors hover:border-black'
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='grid gap-3 py-8 sm:grid-cols-[1fr_auto]'>
                <button
                  type='button'
                  className='inline-flex h-12 items-center justify-center gap-3 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
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

              <div className='space-y-4 border-t border-black/10 pt-8'>
                <h2 className='font-heading text-2xl font-semibold'>
                  Product details
                </h2>
                <ul className='space-y-3 text-sm leading-6 text-muted-foreground'>
                  {product.details.map((detail) => (
                    <li key={detail} className='border-b border-black/10 pb-3'>
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

            <div className='grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4'>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
