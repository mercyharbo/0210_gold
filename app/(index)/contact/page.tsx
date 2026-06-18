import { ArrowRight, Mail, MapPin, MessageCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

const contactMethods = [
  {
    title: 'General enquiries',
    description: 'Questions about products, categories, companies, or orders.',
    detail: 'hello@0210gold.com',
    Icon: Mail,
  },
  {
    title: 'Personal shopping',
    description: 'UK shopping requests and Nigeria waybill delivery support.',
    detail: 'Use the request form',
    Icon: ShoppingBag,
  },
  {
    title: 'Location',
    description: 'UK-based service for clients shopping locally and in Nigeria.',
    detail: 'United Kingdom',
    Icon: MapPin,
  },
]

const inputClassName =
  'h-12 w-full border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black'

const textareaClassName =
  'min-h-36 w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors placeholder:text-black/40 focus:border-black'

const labelClassName = 'text-xs font-medium uppercase text-black/45'

export default function ContactPage() {
  return (
    <div className='bg-white text-black'>
      <section className='bg-[#f7f5f0]'>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-12 lg:py-24'>
          <div className='max-w-3xl'>
            <p className='mb-4 text-sm font-medium uppercase text-black/55'>
              Contact
            </p>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Talk to us about shopping, orders, and services
            </h1>
          </div>

          <p className='max-w-2xl text-base leading-7 text-black/68 lg:ml-auto'>
            Send a message about products, personal shopping, UK sourcing,
            Nigerian delicacies, delivery, or any business under 0210.
          </p>
        </div>
      </section>

      <section>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12 lg:py-20'>
          <aside className='space-y-4'>
            {contactMethods.map(({ title, description, detail, Icon }) => (
              <article key={title} className='border border-black/10 p-5'>
                <Icon className='mb-6 size-5 stroke-[1.6]' />
                <h2 className='font-heading text-xl font-semibold'>{title}</h2>
                <p className='mt-3 text-sm leading-6 text-black/65'>
                  {description}
                </p>
                <p className='mt-4 text-sm font-medium text-black'>{detail}</p>
              </article>
            ))}

            <div className='border border-black/10 bg-black p-5 text-white'>
              <MessageCircle className='mb-6 size-5 stroke-[1.6]' />
              <h2 className='font-heading text-xl font-semibold'>
                Shopping request
              </h2>
              <p className='mt-3 text-sm leading-6 text-white/65'>
                For UK sourcing and waybill delivery to Nigeria, use the full
                personal shopper request form.
              </p>
              <Link
                href='/personal-shopper-request'
                className='mt-5 inline-flex items-center gap-3 border-b border-white text-sm font-medium text-white transition-opacity hover:opacity-70'
              >
                Open request form
                <ArrowRight className='size-4 stroke-[1.8]' />
              </Link>
            </div>
          </aside>

          <form className='space-y-8 border border-black/10 p-5 sm:p-8'>
            <div>
              <p className='mb-3 text-sm font-medium uppercase text-black/50'>
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
                  <option>Personal shopping</option>
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
              <p className='max-w-md text-xs leading-5 text-black/55'>
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
