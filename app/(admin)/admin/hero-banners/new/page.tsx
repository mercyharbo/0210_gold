import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { requireAdmin } from '@/lib/auth/session'
import { BannerForm } from '../banner-form'

export default async function NewBannerPage() {
  await requireAdmin()

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        title='Add Banner'
        description='Create a new promotional slideshow banner for the homepage hero section.'
      />
      <BannerForm mode='create' />
    </div>
  )
}
