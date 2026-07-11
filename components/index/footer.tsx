import { Send } from 'lucide-react'
import Link from 'next/link'
import type { SVGProps } from 'react'

const footerGroups = [
  {
    title: 'Shop',
    links: [
      { href: '/shop', label: 'New Arrivals' },
      { href: '/shop', label: 'Best Sellers' },
      { href: '/categories', label: 'All Collections' },
      { href: '/shop', label: 'Gift Cards' },
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
      { href: '/about', label: 'Quality' },
      { href: '/contact', label: 'Terms & Conditions' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { href: '/contact', label: 'Email Us' },
      { href: '/contact', label: 'Store Locations' },
      { href: '/contact', label: 'Social Media' },
    ],
  },
]

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' aria-hidden='true' {...props}>
      <rect
        width='16'
        height='16'
        x='4'
        y='4'
        rx='4.5'
        stroke='currentColor'
        strokeWidth='1.8'
      />
      <circle cx='12' cy='12' r='3.5' stroke='currentColor' strokeWidth='1.8' />
      <circle cx='17' cy='7' r='1.1' fill='currentColor' />
    </svg>
  )
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' {...props}>
      <path d='M14.2 8.4V6.9c0-.7.5-.9.9-.9h2.3V2.2L14.2 2c-3.6 0-4.5 2.7-4.5 4.5v1.9H7v4h2.7V22h4.4v-9.6h3l.5-4h-3.4Z' />
    </svg>
  )
}

function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' {...props}>
      <path d='M16.7 2c.3 2.5 1.7 4 4.1 4.2v3.6a7.6 7.6 0 0 1-4-1.2v6.5c0 4.1-2.8 6.9-6.8 6.9-3.6 0-6.8-2.6-6.8-6.4 0-4.3 4.1-7.2 8.2-6.3v3.8c-1.9-.6-4.2.6-4.2 2.6 0 1.5 1.2 2.6 2.8 2.6 1.8 0 2.9-1 2.9-3.2V2h3.8Z' />
    </svg>
  )
}

const socialLinks = [
  { href: '#', label: 'Instagram', Icon: InstagramIcon },
  { href: '#', label: 'Facebook', Icon: FacebookIcon },
  { href: '#', label: 'TikTok', Icon: TiktokIcon },
]

export function IndexFooter() {
  return (
    <footer className='bg-black text-white'>
      <div className='mx-auto w-full px-5 py-10 sm:px-8 lg:px-12'>
        <div className='grid gap-10 border-b border-white/15 pb-10 lg:grid-cols-[1.2fr_2fr]'>
          <div className='flex flex-col gap-5'>
            <h2 className='font-heading text-xl font-semibold'>
              Join Our Newsletter
            </h2>
            <p className='max-w-sm text-sm leading-6 text-muted-foreground'>
              Be the first to know about new arrivals, exclusive offers and
              style inspiration.
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
                className='inline-flex h-11 items-center gap-2 text-xs font-medium'
              >
                Subscribe
                <Send className='size-4 stroke-[1.6]' />
              </button>
            </form>
          </div>

          <div className='grid grid-cols-2 gap-8 sm:grid-cols-4'>
            {footerGroups.map((group) => (
              <div key={group.title} className='flex flex-col gap-5'>
                <h3 className='font-heading text-sm font-semibold'>
                  {group.title}
                </h3>
                <ul className='space-y-3'>
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
          </div>
        </div>

        <div className='grid gap-8 pt-8 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div className='flex flex-col gap-4'>
            <p className='font-heading text-[clamp(4rem,15vw,12rem)] font-bold leading-none text-white'>
              FM LUXE
            </p>
            <p className='text-xs text-muted-foreground'>
              &copy; 2026 FM LUXE. All Rights Reserved.
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
