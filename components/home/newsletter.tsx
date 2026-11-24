'use client'

import Image from 'next/image'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generalSans } from '@/lib/fonts/storefront'
import { useStoreNewsletter } from '@/stores/hooks/use-storefront-navigation'

export function HomeNewsletter({ autoOpen = true }: { autoOpen?: boolean }) {
  const { newsletterOpen, handleNewsletterOpenChange } = useStoreNewsletter(autoOpen)

  return (
    <Dialog open={newsletterOpen} onOpenChange={handleNewsletterOpenChange}>
      <DialogContent
        overlayClassName='bg-black/80 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none motion-reduce:animate-none'
        className={`${generalSans.className} grid w-[min(760px,calc(100vw-32px))] max-w-[760px]
          grid-cols-1 gap-0 overflow-y-auto rounded-none border-0 p-0 text-black ring-0
          motion-reduce:animate-none motion-reduce:transition-none max-md:max-h-[calc(100svh-32px)]
          md:grid-cols-2 md:overflow-hidden sm:max-w-[760px]
          motion-reduce:[&_*]:animate-none motion-reduce:[&_*]:transition-none`}
      >
        <div className='relative min-h-[220px] md:min-h-[550px]'>
          <Image
            src='/images/hero-editorial-jewellery.png'
            alt='FM LUXE jewellery collection'
            fill
            sizes='(max-width: 767px) 100vw, 380px'
            className='object-cover'
          />
        </div>

        <div className='flex flex-col justify-between gap-6 p-6 md:gap-8'>
          <p className='text-left text-2xl font-semibold leading-none max-[390px]:text-[22px]'>
            fm luxe
          </p>

          <DialogHeader>
            <DialogTitle className='text-[28px] font-semibold leading-[1.1] [font-family:inherit] md:text-[34px]'>
              Join the Collection
            </DialogTitle>

            <DialogDescription>New arrivals and collection updates from FM LUXE.</DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4'>
            <label htmlFor='newsletter-email' className='sr-only'>Email address</label>

            <Input
              id='newsletter-email'
              type='email'
              placeholder='Email'
              disabled
              aria-describedby='newsletter-status'
              className='h-10 rounded-none border-0 bg-[#e6e6e6] px-3 text-black disabled:opacity-100'
            />

            <label htmlFor='newsletter-name' className='sr-only'>Name</label>

            <Input
              id='newsletter-name'
              placeholder='Name'
              disabled
              className='h-10 rounded-none border-0 bg-[#e6e6e6] px-3 text-black disabled:opacity-100'
            />

            <Button disabled className='min-h-10 rounded-none bg-[#e10600] text-white disabled:opacity-50'>
              Join Now
            </Button>

            <p id='newsletter-status' className='text-xs text-gray-600'>
              Newsletter signup coming soon.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
