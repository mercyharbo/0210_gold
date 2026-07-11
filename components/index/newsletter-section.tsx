import { Send } from 'lucide-react'

export function NewsletterSection() {
  return (
    <section className='bg-black text-white'>
      <div className='mx-auto grid w-full gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:px-12 lg:py-16'>
        <div>
          <p className='text-sm font-medium uppercase text-muted-foreground'>
            Newsletter
          </p>
          <h2 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>
            Be the first to know about new arrivals and exclusive drops
          </h2>
        </div>

        <div className='flex flex-col gap-5 lg:items-end'>
          <p className='max-w-xl text-base leading-7 text-muted-foreground lg:text-right'>
            Get updates on featured fashion pieces, gold arrivals, exclusive offers,
            and style inspiration delivered straight to your inbox.
          </p>

          <form className='flex w-full max-w-xl items-center border-b border-white/45'>
            <label htmlFor='home-newsletter-email' className='sr-only'>
              Email address
            </label>
            <input
              id='home-newsletter-email'
              type='email'
              placeholder='Enter your email'
              className='h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground'
            />
            <button
              type='submit'
              className='inline-flex h-12 items-center gap-2 text-xs font-medium'
            >
              Subscribe
              <Send className='size-4 stroke-[1.6]' />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
