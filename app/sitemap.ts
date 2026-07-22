import type { MetadataRoute } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const siteUrl = process.env.SITE_URL ?? 'https://fm-luxe.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      url: `${siteUrl}/make-a-request`,
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
