'use client'

import Link from 'next/link'

import { useStoreSettings } from '@/hooks/use-home-endpoint'
import { useStoreFooter } from '@/stores/hooks/use-storefront-navigation'
import type { CatalogSettings } from '@/types/catalog'

export function StorefrontFooter({ initial }: { initial?: CatalogSettings }) {
  const { data } = useStoreSettings(initial)
  const { setNewsletterOpen } = useStoreFooter()

  const settings = data?.data

  function handleBackToTop() {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return (
    <footer className='flex min-h-svh flex-col gap-12 bg-white px-6 pb-3 pt-16 text-black md:gap-20 md:pt-[106px]'>
      <div className='grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[2.7fr_repeat(3,1fr)_1.25fr] md:gap-8'>
        <div className='col-span-full flex max-w-full flex-col items-start gap-3 md:col-span-1 md:max-w-[420px]'>
          <p className='text-base font-semibold'>
            Gold jewellery for everyday wear and the occasions that stay with you.
          </p>

          <p className='max-w-[300px]'>
            Receive updates on new collections, exclusive releases, and selected pieces before anyone else.
          </p>

          <button
            className='inline-flex min-h-11 w-fit items-center justify-center gap-2.5 bg-black px-4 text-sm font-medium leading-[1.6] text-white transition-colors duration-200 hover:bg-[#e10600] motion-reduce:transition-none'
            onClick={() => setNewsletterOpen(true)}
          >
            Sign Up
          </button>
        </div>

        <nav aria-label='Footer company navigation' className='flex min-w-0 flex-col items-start gap-2'>
          <p className='pb-4 font-semibold'>Company</p>

          <Link href='/about'>About</Link>
          <Link href='/contact'>Contact Us</Link>
        </nav>

        <nav aria-label='Footer service navigation' className='flex min-w-0 flex-col items-start gap-2'>
          <p className='pb-4 font-semibold'>Service</p>

          <Link href='/faq'>FAQ</Link>
          <Link href='/track-order'>Track Order</Link>
          <Link href='/auth/preview/account'>My Account</Link>
        </nav>

        <div className='flex min-w-0 flex-col items-start gap-2'>
          <p className='pb-4 font-semibold'>Contact</p>

          {settings?.support_email && (
            <a className='break-words' href={`mailto:${settings.support_email}`}>
              {settings.support_email}
            </a>
          )}

          {settings?.support_phone && <p>{settings.support_phone}</p>}

          <Link href='/contact'>Get in Touch</Link>
        </div>

        <div className='flex min-w-0 flex-col items-start gap-2'>
          <p className='pb-4 font-semibold'>Currently Shopping</p>

          <span>Nigeria / NG / ₦ / NGN</span>

          <Link
            href='/shop'
            className='inline-flex min-h-11 w-fit items-center justify-center gap-2.5 bg-black px-4 text-sm font-medium leading-[1.6] text-white transition-colors duration-200 hover:bg-[#e10600] motion-reduce:transition-none'
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-4 text-xs'>
        <p>© {settings?.store_name || 'FM LUXE'} {new Date().getFullYear()}. All Rights Reserved</p>

        <button onClick={handleBackToTop}>Back to Top</button>
      </div>

      <p aria-hidden='true' className='w-full whitespace-nowrap pt-6 text-center text-[20vw] font-semibold leading-[.8]'>
        FM LUXE
      </p>
    </footer>
  )
}
