import { AddressesCard } from '@/components/profile/addresses-card'
import { ProfileInformationCard } from '@/components/profile/profile-information-card'
import type { CustomerAddress } from '@/types/address'
import type { CategoryOption } from '@/types/category'
import type { CustomerProfile } from '@/types/profile'

type ProfileFormsProps = {
  profile: CustomerProfile
  addresses: CustomerAddress[]
  categories: CategoryOption[]
  selectedCategoryIds: string[]
  fallbackEmail?: string
}

export function ProfileForms({
  profile,
  addresses,
  categories,
  selectedCategoryIds,
  fallbackEmail,
}: ProfileFormsProps) {
  return (
    <div className='grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'>
      <ProfileInformationCard
        profile={profile}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        fallbackEmail={fallbackEmail}
      />
      <AddressesCard profile={profile} addresses={addresses} />
    </div>
  )
}
