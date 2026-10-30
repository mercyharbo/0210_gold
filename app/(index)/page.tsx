import { FeaturedCollections } from '@/components/index/featured-collections'
import { FeaturedProducts } from '@/components/index/featured-products'
import { HeroBanner } from '@/components/index/hero-banner'
import { getAuthProvider } from '@/lib/auth/provider'
import { CatalogHome } from '@/components/catalog/home'

export default function page() {
  if (getAuthProvider() === 'neon') return <CatalogHome />
  return (
    <main className=''>
      <HeroBanner />
      <FeaturedCollections />
      <FeaturedProducts />
    </main>
  )
}
