import { readHomeContent } from '@/lib/catalog/home'
import { HomeHero } from '@/components/home/hero'
import { NewArrivals } from '@/components/home/new-arrivals'
import { HomeCollections } from '@/components/home/collections'
import { HomeEditorial } from '@/components/home/editorial'

export async function CatalogHome() {
  const { banners, categories, products } = await readHomeContent()
  return (
    <>
      <HomeHero initial={banners} />
      <NewArrivals initial={products} />
      <HomeCollections initial={categories} />
      <HomeEditorial />
    </>
  )
}
