import { StorefrontHeader } from '@/components/storefront/header'
import { StorefrontFooter } from '@/components/storefront/footer'
import { readStoreSettings } from '@/lib/catalog/home'
import { generalSans } from '@/lib/fonts/storefront'
import { HomeNewsletter } from '@/components/home/newsletter'
import '@/components/home/home.css'
import '@/components/home/storefront.css'
import '@/components/home/menu.css'
import '@/components/home/products.css'
import '@/components/home/footer.css'
import '@/components/home/motion.css'
import '@/components/auth/account.css'

export default async function IndexLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await readStoreSettings()
  return (
    <div className={`${generalSans.className} meere-storefront flex min-h-screen flex-col bg-white text-black`}>
      <StorefrontHeader />
      <main id='storefront-content' className='min-w-0 flex-1'>{children}</main>
      <StorefrontFooter initial={settings} />
      <HomeNewsletter />
    </div>
  )
}
