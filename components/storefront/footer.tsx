'use client'

import Link from 'next/link'
import { useStoreSettings } from '@/hooks/use-home-endpoint'
import { useStorefrontNavigation } from '@/stores/storefront-navigation'
import type { CatalogSettings } from '@/types/catalog'

export function StorefrontFooter({ initial }: { initial?: CatalogSettings }) {
  const { data } = useStoreSettings(initial)
  const settings = data?.data
  const openNewsletter = useStorefrontNavigation((state) => state.setNewsletterOpen)

  function backToTop() {
    window.scrollTo({ top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  return (
    <footer className="meere-footer">
      <div className="meere-footer-columns">
        <div className="meere-footer-intro">
          <p className="meere-footer-statement">Gold jewellery for everyday wear and the occasions that stay with you.</p>
          <p>Receive updates on new collections, exclusive releases, and selected pieces before anyone else.</p>
          <button className="meere-black-button" onClick={() => openNewsletter(true)}>Sign Up</button>
        </div>
        <nav aria-label="Footer company navigation" className="meere-footer-column">
          <p>Company</p>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact Us</Link>
        </nav>
        <nav aria-label="Footer service navigation" className="meere-footer-column">
          <p>Service</p>
          <Link href="/faq">FAQ</Link>
          <Link href="/track-order">Track Order</Link>
          <Link href="/auth/preview/account">My Account</Link>
        </nav>
        <div className="meere-footer-column">
          <p>Contact</p>
          {settings?.support_email && <a className="break-words" href={`mailto:${settings.support_email}`}>{settings.support_email}</a>}
          {settings?.support_phone && <p>{settings.support_phone}</p>}
          <Link href="/contact">Get in Touch</Link>
        </div>
        <div className="meere-footer-column">
          <p>Currently Shopping</p>
          <span>Nigeria / NG / ₦ / NGN</span>
          <Link href="/shop" className="meere-black-button">Continue Shopping</Link>
        </div>
      </div>
      <div className="meere-footer-bottom">
        <p>© {settings?.store_name || 'FM LUXE'} {new Date().getFullYear()}. All Rights Reserved</p>
        <button onClick={backToTop}>Back to Top</button>
      </div>
      <p aria-hidden="true" className="meere-wordmark">FM LUXE</p>
    </footer>
  )
}
