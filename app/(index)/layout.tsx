import '@/components/auth/account.css'
import { HomeNewsletter } from '@/components/home/newsletter'
import { StorefrontFooter } from '@/components/storefront/footer'
import { StorefrontHeader } from '@/components/storefront/header'
import { readStoreSettings } from '@/lib/catalog/home'
import { generalSans } from '@/lib/fonts/storefront'

export default async function IndexLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await readStoreSettings()

  return (
    <div
      className={`${generalSans.className} min-h-screen flex flex-col bg-white text-sm leading-[1.6] text-black
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
      <main id='storefront-content' className='min-w-0 flex-1'>
        {children}
      </main>
      <StorefrontFooter initial={settings} />
      <HomeNewsletter />
    </div>
  )
}
