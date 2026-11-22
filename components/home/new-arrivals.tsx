'use client'

import { useHomeProducts } from '@/hooks/use-home-endpoint'
import type { CatalogPage } from '@/types/catalog'
import { HomeProductCard } from './product-card'
import { ReadFeedback } from './read-feedback'

export function NewArrivals({ initial }: { initial?: CatalogPage }) {
  const { data, error, isLoading, mutate } = useHomeProducts(initial)
  const products = data?.data

  return (
    <section id="new-arrivals" aria-labelledby="arrivals-title" className="meere-products">
      <h2 id="arrivals-title" className="meere-section-title">New Arrivals</h2>
      <ReadFeedback loading={isLoading} error={error} hasData={!!products}
        retry={() => { void mutate() }} />
      {products && products.items.length > 0 && (
        <div className="meere-product-grid">
          {products.items.map((product) => <HomeProductCard key={product.id} product={product} />)}
        </div>
      )}
      {products && !products.items.length && <p className="meere-empty">Our next pieces are on their way. Explore FM LUXE while we prepare the collection.</p>}
    </section>
  )
}
