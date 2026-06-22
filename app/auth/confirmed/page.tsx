import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AuthConfirmedPage() {
  return (
    <main className='min-h-dvh bg-muted px-5 py-12 text-black sm:px-8 lg:px-12'>
      <div className='mx-auto flex min-h-[calc(100dvh-6rem)] max-w-3xl items-center justify-center'>
        <section className='w-full border border-black/10 bg-white p-6 text-center sm:p-10'>
          <div className='mx-auto mb-6 grid size-16 place-items-center bg-gold/35'>
            <CheckCircle2 className='size-8' strokeWidth={1.7} />
          </div>

          <p className='text-xs font-semibold uppercase text-gold'>
            Email confirmed
          </p>
          <h1 className='mx-auto mt-3 max-w-xl font-heading text-5xl font-semibold leading-none sm:text-6xl'>
            Your account is ready.
          </h1>
          <p className='mx-auto mt-5 max-w-lg text-sm leading-6 text-muted-foreground'>
            Your email address has been confirmed. You can now sign in and
            access your customer profile, order history, saved items, and
            shopping requests.
          </p>

          <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
            <Link
              href='/login'
              className='inline-flex h-12 items-center justify-center gap-2 bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gold'
            >
              Sign in
              <ArrowRight className='size-4' strokeWidth={1.8} />
            </Link>
            <Link
              href='/shop'
              className='inline-flex h-12 items-center justify-center border border-black px-6 text-sm font-semibold transition-colors hover:bg-black hover:text-white'
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
