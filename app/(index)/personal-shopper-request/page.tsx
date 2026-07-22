'use client'

import { useState, useTransition } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Crown,
  Loader2,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import { submitPersonalShopperRequestAction } from './actions'

const serviceSteps = [
  {
    step: '01',
    title: 'Share Your Brief',
    description:
      'Tell us what luxury piece, fashion item, abaya, or jewellery you desire with sizes, budget, and links.',
    Icon: ClipboardList,
  },
  {
    step: '02',
    title: 'UK Sourcing & Verification',
    description:
      'Our personal shoppers source authentic items directly from top UK boutiques and verify quality.',
    Icon: ShoppingBag,
  },
  {
    step: '03',
    title: 'Doorstep Waybill to Nigeria',
    description:
      'Your order is carefully packaged and shipped via express air freight with tracking to your doorstep in Nigeria.',
    Icon: PackageCheck,
  },
]

const inputClassName =
  'h-12 w-full border border-black/15 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold'

const textareaClassName =
  'min-h-36 w-full resize-none border border-black/15 bg-white px-4 py-3 text-sm text-black outline-none transition-colors placeholder:text-muted-foreground focus:border-gold focus:ring-1 focus:ring-gold'

const labelClassName = 'text-xs font-semibold uppercase tracking-wider text-black/70'

export default function PersonalShopperRequestPage() {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    category: 'Jewellery & Gold',
    budget: '',
    size: '',
    preferredStoresOrLinks: '',
    deliveryCity: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    startTransition(async () => {
      const res = await submitPersonalShopperRequestAction(formData)
      if (res.success && res.requestId) {
        setSubmittedRequestId(res.requestId)
      } else {
        setErrorMsg(res.error || 'Failed to submit request.')
      }
    })
  }

  return (
    <div className='bg-white text-black min-h-screen'>
      {/* Header Banner */}
      <section className='border-b border-black/10 bg-neutral-900 text-white px-5 py-16 sm:px-8 lg:px-12 lg:py-24'>
        <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end'>
          <div className='space-y-4'>
            <div className='inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold'>
              <Crown className='size-3.5' />
              Personal Shopper Service
            </div>
            <h1 className='font-heading text-5xl font-bold leading-[0.95] sm:text-6xl lg:text-7xl'>
              Bespoke UK Sourcing, Delivered to Nigeria.
            </h1>
          </div>

          <p className='max-w-xl text-base leading-relaxed text-neutral-300 lg:justify-self-end'>
            Looking for an exclusive gold necklace, designer abaya, sold-out UK handbag, or custom piece? 
            Our dedicated personal shopping concierge handles sourcing, authenticity checks, and delivery directly to your door in Nigeria.
          </p>
        </div>
      </section>

      {/* Main Form & Guidance Section */}
      <section className='px-5 py-14 sm:px-8 lg:px-12'>
        <div className='mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]'>
          {/* Left Column: Process steps & perk card */}
          <div className='space-y-6'>
            <div className='border border-black/10 p-6 sm:p-8 space-y-6'>
              <div className='flex items-center gap-2 text-gold'>
                <Sparkles className='size-5' />
                <h3 className='font-heading text-xl font-bold uppercase tracking-wider text-black'>
                  How It Works
                </h3>
              </div>

              <div className='space-y-6'>
                {serviceSteps.map(({ step, title, description, Icon }) => (
                  <div key={title} className='flex gap-4 items-start border-b border-black/5 pb-5 last:border-0 last:pb-0'>
                    <span className='flex size-10 shrink-0 items-center justify-center rounded-none bg-neutral-100 text-xs font-bold font-mono text-black'>
                      {step}
                    </span>
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2 font-heading text-lg font-semibold'>
                        <Icon className='size-4 text-gold' />
                        {title}
                      </div>
                      <p className='text-xs leading-relaxed text-muted-foreground'>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-black p-6 sm:p-8 text-white space-y-4 border border-black'>
              <Crown className='size-6 text-gold' />
              <h4 className='font-heading text-2xl font-semibold'>Need Instant Assistance?</h4>
              <p className='text-xs leading-relaxed text-neutral-400'>
                Have questions or urgent deadlines? Chat directly with our personal shopper concierge for immediate updates on UK luxury sourcing.
              </p>
              <Link
                href='/contact'
                className='inline-flex h-11 items-center justify-center gap-2 bg-gold px-6 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-white'
              >
                Contact Concierge
                <ArrowRight className='size-3.5' />
              </Link>
            </div>
          </div>

          {/* Right Column: Request Form or Success Card */}
          <div className='border border-black/10 p-6 sm:p-10 bg-white'>
            {submittedRequestId ? (
              <div className='flex flex-col items-center justify-center text-center py-12 space-y-6'>
                <div className='size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center'>
                  <CheckCircle2 className='size-10' />
                </div>
                <div className='space-y-2 max-w-md'>
                  <h2 className='font-heading text-3xl font-bold'>Request Submitted!</h2>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    Thank you! Your personal shopper request has been received. Our concierge team will review your brief and contact you shortly via WhatsApp or Email.
                  </p>
                  <p className='text-xs font-mono text-neutral-400 pt-2'>
                    Reference ID: #{submittedRequestId}
                  </p>
                </div>

                <div className='flex flex-wrap gap-4 pt-4'>
                  <button
                    onClick={() => {
                      setSubmittedRequestId(null)
                      setFormData({
                        fullName: '',
                        phone: '',
                        email: '',
                        category: 'Jewellery & Gold',
                        budget: '',
                        size: '',
                        preferredStoresOrLinks: '',
                        deliveryCity: '',
                        message: '',
                      })
                    }}
                    className='h-11 px-6 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors'
                  >
                    Submit Another Request
                  </button>
                  <Link
                    href='/shop'
                    className='h-11 px-6 border border-black text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-colors flex items-center justify-center'
                  >
                    Explore Shop
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='border-b border-black/10 pb-4'>
                  <p className='text-xs font-semibold uppercase text-gold'>Request Form</p>
                  <h2 className='font-heading text-3xl font-bold'>Personal Shopper Brief</h2>
                </div>

                {errorMsg && (
                  <div className='bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-xs font-medium'>
                    {errorMsg}
                  </div>
                )}

                <div className='grid gap-5 md:grid-cols-2'>
                  <div className='space-y-1.5'>
                    <label htmlFor='fullName' className={labelClassName}>Full Name *</label>
                    <input
                      id='fullName'
                      name='fullName'
                      type='text'
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder='e.g. Amara Kalu'
                      className={inputClassName}
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label htmlFor='phone' className={labelClassName}>Phone / WhatsApp *</label>
                    <input
                      id='phone'
                      name='phone'
                      type='tel'
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder='+234 800 000 0000'
                      className={inputClassName}
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label htmlFor='email' className={labelClassName}>Email Address *</label>
                    <input
                      id='email'
                      name='email'
                      type='email'
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder='you@example.com'
                      className={inputClassName}
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label htmlFor='category' className={labelClassName}>Category *</label>
                    <select
                      id='category'
                      name='category'
                      value={formData.category}
                      onChange={handleChange}
                      className={inputClassName}
                    >
                      <option value='Jewellery & Gold'>Jewellery & Gold</option>
                      <option value='Abaya & Modest Wear'>Abaya & Modest Wear</option>
                      <option value='Designer Bags'>Designer Bags</option>
                      <option value='Luxury Footwear'>Luxury Footwear</option>
                      <option value='Clothing & Apparel'>Clothing & Apparel</option>
                      <option value='Accessories & Watches'>Accessories & Watches</option>
                      <option value='Bespoke Sourcing'>Bespoke Custom Sourcing</option>
                    </select>
                  </div>

                  <div className='space-y-1.5'>
                    <label htmlFor='budget' className={labelClassName}>Target Budget</label>
                    <input
                      id='budget'
                      name='budget'
                      type='text'
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder='e.g. ₦250,000 or £150'
                      className={inputClassName}
                    />
                  </div>

                  <div className='space-y-1.5'>
                    <label htmlFor='size' className={labelClassName}>Size / Specs</label>
                    <input
                      id='size'
                      name='size'
                      type='text'
                      value={formData.size}
                      onChange={handleChange}
                      placeholder='e.g. UK 10, EU 39, 18-inch'
                      className={inputClassName}
                    />
                  </div>

                  <div className='space-y-1.5 md:col-span-2'>
                    <label htmlFor='preferredStoresOrLinks' className={labelClassName}>Preferred Stores or Product Links</label>
                    <input
                      id='preferredStoresOrLinks'
                      name='preferredStoresOrLinks'
                      type='text'
                      value={formData.preferredStoresOrLinks}
                      onChange={handleChange}
                      placeholder='e.g. Selfridges, Harrods, Zara UK, Instagram link...'
                      className={inputClassName}
                    />
                  </div>

                  <div className='space-y-1.5 md:col-span-2'>
                    <label htmlFor='deliveryCity' className={labelClassName}>Delivery City in Nigeria</label>
                    <input
                      id='deliveryCity'
                      name='deliveryCity'
                      type='text'
                      value={formData.deliveryCity}
                      onChange={handleChange}
                      placeholder='e.g. Lagos, Osogbo, Abuja, Port Harcourt'
                      className={inputClassName}
                    />
                  </div>

                  <div className='space-y-1.5 md:col-span-2'>
                    <label htmlFor='message' className={labelClassName}>Request Details & Description *</label>
                    <textarea
                      id='message'
                      name='message'
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder='Describe the item color, material, occasion, deadline, or special instructions for our shoppers.'
                      className={textareaClassName}
                    />
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/10 pt-6'>
                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    Our team will verify availability and respond with pricing & timeline.
                  </p>
                  <button
                    type='submit'
                    disabled={isPending}
                    className='w-full sm:w-auto inline-flex h-12 items-center justify-center gap-3 bg-black px-8 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold hover:text-black disabled:opacity-50'
                  >
                    {isPending ? (
                      <>
                        <Loader2 className='size-4 animate-spin' />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Brief
                        <ArrowRight className='size-4' />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
