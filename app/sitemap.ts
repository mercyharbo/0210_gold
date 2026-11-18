import type { MetadataRoute } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getAuthProvider } from '@/lib/auth/provider'
import { readCatalog } from '@/lib/catalog/server'
import type { CatalogPage } from '@/types/catalog'

const siteUrl = process.env.SITE_URL ?? 'https://fm-luxe.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (getAuthProvider() === 'neon') {
    const routes: MetadataRoute.Sitemap = ['/', '/shop', '/categories', '/about', '/contact'].map((path) => ({ url: `${siteUrl}${path}` }))
    let page = 1
    let result: CatalogPage
    do {
      result = await readCatalog<CatalogPage>(`products?page=${page}&page_size=100`)
      routes.push(...result.items.map((item) => ({ url: `${siteUrl}/products/${item.slug}`, lastModified: new Date(item.updated_at) })))
      page += 1
    } while ((page - 1) * result.page_size < result.total)
    return routes
  }
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  let productRoutes: MetadataRoute.Sitemap = []

  try {
    const supabase = await createSupabaseServerClient()
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (products && products.length > 0) {
      productRoutes = products.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {
    productRoutes = []
  }

  return [...staticRoutes, ...productRoutes]
}
