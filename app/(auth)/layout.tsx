import { StorefrontHeader } from '@/components/storefront/header'
import { StorefrontFooter } from '@/components/storefront/footer'
import { HomeNewsletter } from '@/components/home/newsletter'
import { readStoreSettings } from '@/lib/catalog/home'
import { generalSans } from '@/lib/fonts/storefront'
import '@/components/home/home.css'
import '@/components/home/storefront.css'
import '@/components/home/menu.css'
import '@/components/home/products.css'
import '@/components/home/footer.css'
import '@/components/home/motion.css'
import '@/components/auth/account.css'

export const dynamic = 'force-dynamic'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await readStoreSettings()
  return (
    <div className={`${generalSans.className} meere-storefront flex min-h-dvh flex-col bg-white text-black`}>
      <StorefrontHeader />
      <main id='storefront-content' className='meere-account min-w-0 flex-1 px-5 py-12 sm:px-6 sm:py-16'>
        <div className='mx-auto w-full max-w-md'>{children}</div>
      </main>
      <StorefrontFooter initial={settings} />
      <HomeNewsletter autoOpen={false} />
    </div>
  )
}
