import { getStorefrontHeroBanners } from '@/lib/hero-banners/storefront-hero-banners'
import { HeroSlideshow } from './hero-slideshow'
import type { HeroBanner as THeroBanner } from '@/types/hero-banner'

export async function HeroBanner() {
  const banners = await getStorefrontHeroBanners()

  const bannerData: THeroBanner[] =
    banners.length > 0
      ? banners
      : [
          {
            id: 'default-banner',
            title: 'Gold that defines you',
            description:
              'Timeless gold jewellery crafted for every moment. Elegance. Quality. You.',
            image_src: '/images/hero-editorial-jewellery.png',
            route: '/shop',
            sort_order: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

  return <HeroSlideshow banners={bannerData} />
}
