import { ArrowRight, ClipboardList, PackageCheck, ShoppingBag } from 'lucide-react'

const serviceSteps = [
  {
    title: 'Share the brief',
    description:
      'Send the item type, size, color, budget, links, screenshots, or store names.',
    Icon: ClipboardList,
  },
  {
    title: 'We shop in the UK',
    description:
      'Your request is reviewed, sourced, checked, and prepared for delivery.',
    Icon: ShoppingBag,
  },
  {
    title: 'Waybill to Nigeria',
    description:
      'Items are packed and sent to Nigeria with clear delivery information.',
    Icon: PackageCheck,
  },
]

const inputClassName =
  'h-12 w-full border border-black/10 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-black'

const textareaClassName =
  'min-h-32 w-full resize-none border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-black'

const labelClassName = 'text-xs font-medium uppercase text-muted-foreground'

export default function PersonalShopperRequestPage() {
  return (
    <div className='bg-white text-black'>
      <section className='bg-muted'>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:px-12 lg:py-24'>
          <div className='max-w-3xl'>
            <p className='mb-4 text-sm font-medium uppercase text-muted-foreground'>
              Personal shopper request
            </p>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Shop from the UK, delivered to Nigeria
            </h1>
          </div>

          <p className='max-w-2xl text-base leading-7 text-muted-foreground lg:ml-auto'>
            Send the fashion, gold, accessories, shoes, bags, or special items
            you want. We review the request, source from the UK, and prepare the
            order for waybill delivery to Nigeria.
          </p>
        </div>
      </section>

      <section>
        <div className='mx-auto grid w-full gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-12 lg:py-20'>
          <aside className='space-y-4'>
            {serviceSteps.map(({ title, description, Icon }) => (
              <article key={title} className='border border-black/10 p-5'>
                <Icon className='mb-6 size-5 stroke-[1.6]' />
                <h2 className='font-heading text-xl font-semibold'>{title}</h2>
                <p className='mt-3 text-sm leading-6 text-muted-foreground'>
                  {description}
                </p>
              </article>
            ))}
          </aside>

          <form className='space-y-8 border border-black/10 p-5 sm:p-8'>
            <div>
              <p className='mb-3 text-sm font-medium uppercase text-muted-foreground'>
                Request details
              </p>
              <h2 className='font-heading text-4xl font-bold leading-tight'>
                Tell us what to shop
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
                <span className={labelClassName}>Phone or WhatsApp</span>
                <input
                  className={inputClassName}
                  name='phone'
                  placeholder='+234...'
                  type='tel'
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
                <span className={labelClassName}>Item category</span>
                <select className={inputClassName} name='category'>
                  <option>Clothing</option>
                  <option>Abaya</option>
                  <option>Bags</option>
                  <option>Shoes</option>
                  <option>Jewellery & Accessories</option>
                  <option>Modest Sets</option>
                  <option>Other</option>
                </select>
              </label>

              <label className='space-y-2'>
                <span className={labelClassName}>Budget</span>
                <input
                  className={inputClassName}
                  name='budget'
                  placeholder='Example: ₦150,000'
                  type='text'
                />
              </label>

              <label className='space-y-2'>
                <span className={labelClassName}>Size</span>
                <input
                  className={inputClassName}
                  name='size'
                  placeholder='Example: UK 10, EU 39, M'
                  type='text'
                />
              </label>

              <label className='space-y-2 md:col-span-2'>
                <span className={labelClassName}>Preferred stores or links</span>
                <input
                  className={inputClassName}
                  name='links'
                  placeholder='Paste product links or store names'
                  type='text'
                />
              </label>

              <label className='space-y-2 md:col-span-2'>
                <span className={labelClassName}>Delivery city in Nigeria</span>
                <input
                  className={inputClassName}
                  name='deliveryCity'
                  placeholder='Example: Lagos, Abuja, Port Harcourt'
                  type='text'
                />
              </label>

              <label className='space-y-2 md:col-span-2'>
                <span className={labelClassName}>What should we source?</span>
                <textarea
                  className={textareaClassName}
                  name='message'
                  placeholder='Describe the item, color, quantity, deadline, occasion, and any important details.'
                />
              </label>
            </div>

            <div className='flex flex-col gap-4 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between'>
              <p className='max-w-md text-xs leading-5 text-muted-foreground'>
                Include links, screenshots, sizes, and budget details where
                possible so the request can be reviewed clearly.
              </p>
              <button
                type='submit'
                className='inline-flex h-12 items-center justify-center gap-4 bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-black/82'
              >
                Submit request
                <ArrowRight className='size-4 stroke-[1.8]' />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
