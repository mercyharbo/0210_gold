import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='min-h-dvh bg-muted text-black'>
      <div className='grid min-h-dvh lg:grid-cols-[0.82fr_1.18fr]'>
        <section className='flex flex-col justify-between bg-black px-5 py-8 text-white sm:px-8 lg:px-12'>
          <Link
            href='/'
            className='inline-flex w-fit items-center gap-3 text-sm font-medium text-muted-foreground transition-colors hover:text-white'
          >
            <ArrowLeft className='size-4' strokeWidth={1.7} />
            Back to home
          </Link>

          <div className='flex flex-col gap-6 py-16 lg:py-24'>
            <p className='text-xs font-semibold uppercase text-gold'>
              0210 Gold account
            </p>
            <h1 className='max-w-xl font-sans text-5xl font-semibold leading-[0.95] sm:text-6xl'>
              Manage your shopping profile securely.
            </h1>
            <p className='max-w-lg text-sm leading-6 text-muted-foreground'>
              Sign in or create an account to keep orders, product requests,
              saved items, addresses, and account security in one place.
            </p>
          </div>

          <div className='flex max-w-md gap-3 border-t border-white/15 pt-6'>
            <ShieldCheck
              className='mt-0.5 size-5 shrink-0 text-gold'
              strokeWidth={1.7}
            />
            <p className='text-xs leading-5 text-muted-foreground'>
              Your account keeps shopping activity, order support, saved items,
              and security settings connected in one place.
            </p>
          </div>
        </section>

        <section className='flex items-center justify-center px-5 py-12 sm:px-8 lg:px-12'>
          <div className='w-full max-w-xl border border-black/10 bg-white p-6 sm:p-8'>
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
