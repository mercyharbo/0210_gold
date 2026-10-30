import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { readCatalog } from '@/lib/catalog/server'
import type { CatalogCategory } from '@/types/catalog'
export const metadata: Metadata = { title: 'Collections | FM LUXE', alternates: { canonical: '/categories' } }
export default async function CollectionsPage() {
  const categories = await readCatalog<CatalogCategory[]>('categories')
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-12">
      <h1 className="text-3xl font-semibold">Our collections</h1>
      {!categories.length && <p className="text-sm text-gray-600">New collections are on their way.</p>}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link href={`/shop?category=${category.slug}`} key={category.id} className="flex flex-col gap-3">
            {category.images[0] && (
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={category.images[0].url}
                  alt={category.images[0].alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="text-xl font-medium">{category.name}</h2>
            <p className="text-sm text-gray-600">{category.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
