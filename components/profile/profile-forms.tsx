import { AddressesCard } from '@/components/profile/addresses-card'
import { ProfileInformationCard } from '@/components/profile/profile-information-card'
import type { CustomerAddress } from '@/types/address'
import type { CustomerProfile } from '@/types/profile'

type ProfileFormsProps = {
  profile: CustomerProfile
  addresses: CustomerAddress[]
  fallbackEmail?: string
}

export function ProfileForms({
  profile,
  addresses,
  fallbackEmail,
}: ProfileFormsProps) {
  return (
    <div className='grid gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'>
      <ProfileInformationCard profile={profile} fallbackEmail={fallbackEmail} />
      <AddressesCard profile={profile} addresses={addresses} />
    </div>
  )
}
