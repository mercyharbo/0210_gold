import Image from 'next/image'
import Link from 'next/link'
import { readCatalog } from '@/lib/catalog/server'
import type { CatalogBanner, CatalogCategory, CatalogPage } from '@/types/catalog'
import { CatalogProductCard } from './product-card'

export async function CatalogHome() {
  const [banners, categories, products] = await Promise.all([
    readCatalog<CatalogBanner[]>('banners'),
    readCatalog<CatalogCategory[]>('categories'),
    readCatalog<CatalogPage>('products?page_size=8'),
  ])
  return (
    <div className="flex flex-col gap-12 pb-12">
      {banners.length ? (
        banners.map((banner) => (
          <section key={banner.id} className="relative grid min-h-96 items-end bg-black text-white">
            {banner.images[0] && (
              <Image
                src={banner.images[0].url}
                alt={banner.images[0].alt}
                fill
                sizes="100vw"
                className="object-cover opacity-60"
                priority
              />
            )}
            <div className="relative flex max-w-2xl flex-col items-start gap-5 px-5 py-16 sm:px-8 lg:px-12">
              <h1 className="text-4xl font-semibold sm:text-5xl">{banner.title}</h1>
              <p className="text-base">{banner.description}</p>
              <Link href={banner.route} className="border border-white px-6 py-3 text-sm">
                Explore the collection
              </Link>
            </div>
          </section>
        ))
      ) : (
        <section className="relative grid min-h-96 items-end bg-black text-white">
          <Image
            src="/images/hero-editorial-jewellery.png"
            alt="FM LUXE jewellery editorial"
            fill
            sizes="100vw"
            className="object-cover opacity-60"
            priority
          />
          <div className="relative flex max-w-2xl flex-col items-start gap-5 px-5 py-16 sm:px-8 lg:px-12">
            <h1 className="text-4xl font-semibold sm:text-5xl">Fashion &amp; style, refined</h1>
            <p>Fine gold, considered fashion, and the details that make it yours.</p>
            <Link href="/shop" className="border border-white px-6 py-3 text-sm">
              Explore the collection
            </Link>
          </div>
        </section>
      )}
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 sm:px-8 lg:px-12">
        <h2 className="text-2xl font-semibold">Featured collections</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((category) => category.is_featured)
            .sort((a, b) => a.featured_sort_order - b.featured_sort_order)
            .map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="flex flex-col gap-3"
              >
                {category.images[0] && (
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={category.images[0].url}
                      alt={category.images[0].alt}
                      fill
                      sizes="33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="text-lg font-medium">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </Link>
            ))}
        </div>
        {!categories.some((item) => item.is_featured) && (
          <p className="text-sm text-gray-600">New collections are on their way.</p>
        )}
      </section>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">New arrivals</h2>
          <Link href="/shop" className="text-sm underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {products.items.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
        </div>
        {!products.items.length && (
          <p className="text-sm text-gray-600">Our new collection will appear here soon.</p>
        )}
      </section>
    </div>
  )
}
