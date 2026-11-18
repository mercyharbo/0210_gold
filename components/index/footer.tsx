import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import Link from 'next/link'
import { socialLinks } from './social-icons'

import { defaultStoreSettings, type StoreSettingsRecord } from '@/lib/settings/types'

type IndexFooterProps = {
  settings?: StoreSettingsRecord
}

const footerGroups = [
  {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'New Arrivals' },
      { href: '/shop', label: 'Best Sellers' },
      { href: '/categories', label: 'All Collections' },
    ],
  },
  {
    title: 'Customer Care',
    links: [
      { href: '/contact', label: 'Shipping & Returns' },
      { href: '/track-order', label: 'Order Tracking' },
      { href: '/contact', label: 'Size Guide' },
      { href: '/faq', label: 'FAQs' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'Our Story' },
      { href: '/about', label: 'Quality & Craftsmanship' },
      { href: '/contact', label: 'Terms & Conditions' },
    ],
  },
]

export function IndexFooter({ settings = defaultStoreSettings }: IndexFooterProps) {
  const cleanPhone = settings.support_phone.replace(/[^0-9+]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}`

  return (
    <footer className='bg-black text-white font-sans'>
      <div className='mx-auto w-full px-5 py-10 sm:px-8 lg:px-12'>
        <div className='grid gap-10 border-b border-white/15 pb-10 lg:grid-cols-[1.2fr_2fr]'>
          {/* Newsletter Section */}
          <div className='flex flex-col gap-5'>
            <h2 className='font-heading text-xl font-semibold'>
              Join Our Newsletter
            </h2>
            <p className='max-w-sm text-sm leading-6 text-muted-foreground'>
              Be the first to know about new jewellery arrivals and collection updates.
            </p>
            <form className='flex max-w-md items-center border-b border-white/45'>
              <label htmlFor='newsletter-email' className='sr-only'>
                Email address
              </label>
              <input
                id='newsletter-email'
                type='email'
                placeholder='Enter your email'
                className='h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground'
              />
              <button
                type='submit'
                className='inline-flex h-11 items-center gap-2 text-xs font-medium hover:text-gold transition-colors cursor-pointer'
              >
                Subscribe
                <Send className='size-4 stroke-[1.6]' />
              </button>
            </form>
          </div>

          {/* Nav Groups + Contact Details Column */}
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            {footerGroups.map((group) => (
              <div key={group.title} className='flex flex-col gap-5'>
                <h3 className='font-heading text-sm font-semibold'>
                  {group.title}
                </h3>
                <ul className='flex flex-col gap-3'>
                  {group.links.map(({ href, label }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className='text-xs text-muted-foreground transition-colors hover:text-white'
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Dynamic Store & Boutique Info Column */}
            <div className='flex flex-col gap-4 text-xs'>
              <h3 className='font-heading text-sm font-semibold text-white'>
                Boutique & Contact
              </h3>
              
              <div className='flex flex-col gap-3 text-muted-foreground'>
                {settings.store_address && (
                  <div className='flex items-start gap-2.5'>
                    <MapPin className='size-4 text-gold shrink-0 ' />
                    <span className='leading-relaxed'>{settings.store_address}</span>
                  </div>
                )}

                {settings.support_phone && (
                  <div className='flex items-center gap-2.5'>
                    <Phone className='size-4 text-gold shrink-0' />
                    <a
                      href={whatsappUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='hover:text-white transition-colors underline-offset-2 hover:underline'
                    >
                      {settings.support_phone} (WhatsApp)
                    </a>
                  </div>
                )}

                {settings.support_email && (
                  <div className='flex items-center gap-2.5'>
                    <Mail className='size-4 text-gold shrink-0' />
                    <a
                      href={`mailto:${settings.support_email}`}
                      className='hover:text-white transition-colors underline-offset-2 hover:underline truncate'
                    >
                      {settings.support_email}
                    </a>
                  </div>
                )}

                {settings.business_hours && (
                  <div className='flex items-start gap-2.5'>
                    <Clock className='size-4 text-gold shrink-0 ' />
                    <span className='leading-relaxed'>{settings.business_hours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='grid gap-8 pt-8 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div className='flex flex-col gap-4'>
            <p className='font-heading text-6xl font-bold leading-none text-white sm:text-8xl lg:text-9xl'>
              {settings.store_name?.toUpperCase() || 'FM LUXE'}
            </p>
            <p className='text-xs text-muted-foreground'>
              &copy; {new Date().getFullYear()} {settings.store_name || 'FM LUXE'}. All Rights Reserved.
            </p>
          </div>

          <div className='flex flex-col gap-6 lg:items-end'>
            <div className='flex items-center gap-4'>
              {socialLinks.map(({ href, label, Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className='grid size-9 place-items-center rounded-full border border-white/45 text-white transition-colors hover:bg-white hover:text-black'
                >
                  <Icon className='size-4' />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

