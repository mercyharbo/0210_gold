import { notFound } from 'next/navigation'

import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { requireAdmin } from '@/lib/auth/session'
import { getAdminHeroBannerById } from '@/lib/hero-banners/admin-hero-banners'
import { BannerForm } from '../banner-form'

type EditBannerPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  await requireAdmin()

  const { id } = await params
  const banner = await getAdminHeroBannerById(id)

  if (!banner) {
    notFound()
  }

  return (
    <div className='flex flex-col gap-6'>
      <AdminPageHeader
        title='Edit Banner'
        description={`Update settings and copy for the slideshow banner: ${banner.title}`}
      />
      <BannerForm mode='edit' banner={banner} />
    </div>
  )
}
