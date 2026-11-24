import { StorefrontHeader } from '@/components/storefront/header'
import { StorefrontFooter } from '@/components/storefront/footer'
import { HomeNewsletter } from '@/components/home/newsletter'
import { readStoreSettings } from '@/lib/catalog/home'
import { generalSans } from '@/lib/fonts/storefront'
import '@/components/auth/account.css'

export const dynamic = 'force-dynamic'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await readStoreSettings()

  return (
    <div
      className={`${generalSans.className} min-h-dvh flex flex-col bg-white text-sm leading-[1.6] text-black
        [&_h1]:[font-family:inherit] [&_h2]:[font-family:inherit] [&_h3]:[font-family:inherit]
        [&_a]:[-webkit-tap-highlight-color:transparent]
        [&_button]:[-webkit-tap-highlight-color:transparent]
        [&_:is(a,button,input):focus-visible]:outline-2
        [&_:is(a,button,input):focus-visible]:outline-offset-4
        [&_:is(a,button,input):focus-visible]:outline-[#e10600]
        motion-reduce:[&_*]:animate-none
        motion-reduce:[&_*]:transition-none
        motion-reduce:[&_*]:scroll-auto`}
    >
      <StorefrontHeader />
      <main id='storefront-content' className='meere-account min-w-0 flex-1 px-5 py-12 sm:px-6 sm:py-16'>
        <div
      className='mx-auto w-full max-w-md'>{children}</div>
      </main>
      <StorefrontFooter initial={settings} />
      <HomeNewsletter autoOpen={false} />
    </div>
  )
}
