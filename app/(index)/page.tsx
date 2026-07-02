import { FeaturedCollections } from '@/components/index/featured-collections'
import { HeroBanner } from '@/components/index/hero-banner'
import { MakeARequest } from '@/components/index/make-a-request'
import { NewsletterSection } from '@/components/index/newsletter-section'
import { OurCompanies } from '@/components/index/our-companies'

export default function page() {
  return (
    <main className=''>
      <HeroBanner />
      <FeaturedCollections />
      <MakeARequest />
      <NewsletterSection />
      <OurCompanies />
    </main>
  )
}
