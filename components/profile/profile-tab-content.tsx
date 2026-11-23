import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ProfileUnavailable({ title }: { title: string }) {
  return (
    <section className='account-profile-section'>
      <h2 className='account-section-title'>{title}</h2>
      <p className='text-sm text-muted-foreground'>This feature is currently unavailable while we connect your account services.</p>
    </section>
  )
}

export function ProfileSecurity() {
  return (
    <section className='account-profile-section'>
      <div className='space-y-2'>
        <h2 className='account-section-title'>Security and support</h2>
        <p className='text-sm text-muted-foreground'>Manage account access or get help with a product or order.</p>
      </div>
      <div className='flex flex-wrap gap-3'>
        <Button asChild variant='outline'><Link href='/forgot-password'>Reset password</Link></Button>
        <Button asChild variant='outline'><Link href='/contact'>Contact support</Link></Button>
      </div>
    </section>
  )
}
