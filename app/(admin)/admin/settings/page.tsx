import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { SettingsClient } from '@/components/admin/settings-client'
import { getStoreSettingsAction } from './actions'

export default async function AdminSettingsPage() {
  const settings = await getStoreSettingsAction()

  return (
    <div className='flex flex-col gap-6 bg-white text-black font-sans'>
      <AdminPageHeader
        title='System Settings'
        description='Configure administrative roles, payment thresholds, currency mapping rates, and shipping policies.'
      />

      <SettingsClient initialSettings={settings} />
    </div>
  )
}
