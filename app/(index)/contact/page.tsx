import type { Metadata } from 'next'
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

import { getStoreSettingsAction } from '@/app/(admin)/admin/settings/actions'

export const metadata: Metadata = {
  title: 'Contact Us | Customer Support & Enquiries',
  description:
    'Get in touch with FM LUXE for jewellery enquiries, order support, and UK to Nigeria personal shopping assistance.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact FM LUXE | Customer Support & Enquiries',
    description:
      'Get in touch with FM LUXE for jewellery enquiries, order support, and UK to Nigeria personal shopping assistance.',
    url: '/contact',
  },
}

const inputClassName =
  'h-12 w-full border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-black'

const textareaClassName =
  'min-h-36 w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-black'

const labelClassName = 'text-xs font-medium uppercase text-muted-foreground'

export default async function ContactPage() {
  const settings = await getStoreSettingsAction()
  const cleanPhone = settings.support_phone.replace(/[^0-9+]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}`

  const contactMethods = [
    {
      title: 'Support Email',
      description: 'Questions about products, orders, or luxury sourcing.',
      detail: settings.support_email,
      href: `mailto:${settings.support_email}`,
      Icon: Mail,
    },
    {
      title: 'Phone & WhatsApp',
      description: 'Instant customer support and WhatsApp concierge.',
      detail: settings.support_phone,
      href: whatsappUrl,
      Icon: Phone,
    },
    {
      title: 'Boutique Location',
      description: 'Physical store location and office address.',
      detail: settings.store_address,
      Icon: MapPin,
    },
    {
      title: 'Opening Hours',
      description: 'Business hours for client support and enquiries.',
      detail: settings.business_hours,
      Icon: Clock,
    },
  ]

  return (
    <div className='bg-white text-black font-sans'>
      <section className='bg-muted'>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-12 lg:py-24'>
          <div className='max-w-3xl'>
            <p className='text-sm font-medium uppercase text-muted-foreground'>
              Contact Us
            </p>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Talk to us about shopping, orders, and services
            </h1>
          </div>

          <p className='max-w-2xl text-base leading-7 text-muted-foreground lg:ml-auto'>
            Send a message about products, custom requests, UK sourcing,
            delivery, or any business under {settings.store_name}.
          </p>
        </div>
      </section>

      <section>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12 lg:py-20'>
          <aside className='space-y-4'>
            {contactMethods.map(({ title, description, detail, href, Icon }) => (
              <article key={title} className='border border-black/10 p-5 space-y-2 bg-white'>
                <Icon className='size-5 text-gold stroke-[1.8]' />
                <h2 className='font-heading text-lg font-semibold'>{title}</h2>
                <p className='text-xs leading-relaxed text-muted-foreground'>
                  {description}
                </p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className='text-xs font-bold text-black hover:text-gold transition-colors block pt-1 underline-offset-2 hover:underline truncate'
                  >
                    {detail}
                  </a>
                ) : (
                  <p className='text-xs font-bold text-black pt-1'>{detail}</p>
                )}
              </article>
            ))}

            <div className='border border-black/10 bg-black p-5 text-white space-y-3'>
              <MessageCircle className='size-5 text-gold stroke-[1.8]' />
              <h2 className='font-heading text-xl font-semibold'>
                Bespoke Shopping Request
              </h2>
              <p className='text-xs leading-relaxed text-neutral-400'>
                For UK sourcing and waybill delivery to Nigeria, use our dedicated personal shopper request form.
              </p>
              <Link
                href='/personal-shopper-request'
                className='inline-flex items-center gap-2 border-b border-white text-xs font-semibold text-white transition-opacity hover:opacity-70 pt-1'
              >
                Open request form
                <ArrowRight className='size-3.5' />
              </Link>
            </div>
          </aside>

          <form className='space-y-8 border border-black/10 p-5 sm:p-8'>
            <div>
              <p className='text-sm font-medium uppercase text-muted-foreground'>
                Send a message
              </p>
              <h2 className='font-heading text-4xl font-bold leading-tight'>
                How can we help?
              </h2>
            </div>

            <div className='grid gap-5 md:grid-cols-2'>
              <label className='space-y-2'>
                <span className={labelClassName}>Full name</span>
                <input
                  className={inputClassName}
                  name='name'
                  placeholder='Your full name'
                  type='text'
                />
              </label>

              <label className='space-y-2'>
                <span className={labelClassName}>Email</span>
                <input
                  className={inputClassName}
                  name='email'
                  placeholder='you@example.com'
                  type='email'
                />
              </label>

              <label className='space-y-2'>
                <span className={labelClassName}>Phone or WhatsApp</span>
                <input
                  className={inputClassName}
                  name='phone'
                  placeholder='+234...'
                  type='tel'
                />
              </label>

              <label className='space-y-2'>
                <span className={labelClassName}>Enquiry type</span>
                <select className={inputClassName} name='type'>
                  <option>Product enquiry</option>
                  <option>Shopping request</option>
                  <option>Order support</option>
                  <option>Nigerian delicacies</option>
                  <option>Company enquiry</option>
                  <option>Other</option>
                </select>
              </label>

              <label className='space-y-2 md:col-span-2'>
                <span className={labelClassName}>Subject</span>
                <input
                  className={inputClassName}
                  name='subject'
                  placeholder='What is this about?'
                  type='text'
                />
              </label>

              <label className='space-y-2 md:col-span-2'>
                <span className={labelClassName}>Message</span>
                <textarea
                  className={textareaClassName}
                  name='message'
                  placeholder='Write your message here.'
                />
              </label>
            </div>

            <div className='flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between'>
              <p className='max-w-md text-xs leading-5 text-muted-foreground'>
                Include your order, product, or service details so the message
                can be directed to the right place.
              </p>
              <button
                type='submit'
                className='inline-flex h-12 items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
              >
                Send message
                <ArrowRight className='size-4 stroke-[1.8]' />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
