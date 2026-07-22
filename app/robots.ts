import type { MetadataRoute } from 'next'

const siteUrl = process.env.SITE_URL ?? 'https://fm-luxe.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/cart',
          '/checkout',
          '/profile',
        ],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Bytespider',
        ],
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/cart',
          '/checkout',
          '/profile',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
