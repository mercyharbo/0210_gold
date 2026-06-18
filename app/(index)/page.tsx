import { FeaturedCollections } from '@/components/index/featured-collections'
import { HeroBanner } from '@/components/index/hero-banner'
import { NewsletterSection } from '@/components/index/newsletter-section'
import { OurCompanies } from '@/components/index/our-companies'
import { PersonalShopper } from '@/components/index/personal-shopper'

export default function page() {
  return (
    <main className=''>
      <HeroBanner />
      <FeaturedCollections />
      <PersonalShopper />
      <NewsletterSection />
      <OurCompanies />
    </main>
  )
}
