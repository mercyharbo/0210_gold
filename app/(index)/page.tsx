import { FeaturedCollections } from '@/components/index/featured-collections'
import { FeaturedProducts } from '@/components/index/featured-products'
import { HeroBanner } from '@/components/index/hero-banner'
import { NewsletterSection } from '@/components/index/newsletter-section'

export default function page() {
  return (
    <main className=''>
      <HeroBanner />
      <FeaturedCollections />
      <FeaturedProducts />
      <NewsletterSection />
    </main>
  )
}
