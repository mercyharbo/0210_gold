'use client'

type CheckoutPromoBannerProps = {
  visible: boolean
}

export function CheckoutPromoBanner({ visible }: CheckoutPromoBannerProps) {
  if (!visible) return null

  return (
    <div className='bg-gold/10 border border-gold/30 p-4 rounded-none flex items-start gap-3'>
      <span className='grid size-8 place-items-center bg-gold text-black rounded-none shrink-0 font-bold text-sm'>
        🎁
      </span>
      <div className='space-y-1'>
        <h4 className='text-sm font-bold text-black uppercase tracking-wider'>
          Sign up & Get Exciting Offers!
        </h4>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          Create an account with us to receive promotional offers, early access to new fashion collections, clothing drops, accessories, and easy order tracking. Simply tick the box under step 3 below to save your details!
        </p>
      </div>
    </div>
  )
}
