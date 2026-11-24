import { HomeCollections } from '@/components/home/collections'
import { HomeEditorial } from '@/components/home/editorial'
import { HomeHero } from '@/components/home/hero'
import { HomeProductSection } from '@/components/home/product-section'
import { readHomeContent } from '@/lib/catalog/home'

export default async function Page() {
  const { banners, categories, products, necklaces, featuredProducts } =
    await readHomeContent()

  return (
    <>
      <HomeHero initial={banners} />
      <HomeProductSection section='arrivals' initial={products} />
      <HomeCollections initial={categories} start={0} />
      <HomeProductSection section='necklaces' initial={necklaces} />
      <HomeCollections initial={categories} start={2} />
      <HomeProductSection section='featured' initial={featuredProducts} />
      <HomeEditorial />
    </>
  )
}
