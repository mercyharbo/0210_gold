import { FeaturedCollections } from '@/components/index/featured-collections'
import { FeaturedProducts } from '@/components/index/featured-products'
import { HeroBanner } from '@/components/index/hero-banner'

export default function page() {
  return (
    <main className=''>
      <HeroBanner />
      <FeaturedCollections />
      <FeaturedProducts />
    </main>
  )
}
