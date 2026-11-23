'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccountProfile } from '@/hooks/use-account-endpoint'
import { generalSans } from '@/lib/fonts/storefront'
import { profileDisplayName } from '@/lib/validations/account-profile'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ProfileInformationCard } from './profile-information-card'
import { ProfileSecurity, ProfileUnavailable } from './profile-tab-content'

const tabs = [
  { value: 'personal-info', label: 'Personal information' },
  { value: 'orders', label: 'My orders' },
  { value: 'addresses', label: 'Manage addresses' },
  { value: 'reviews', label: 'My reviews' },
  { value: 'wishlist', label: 'Saved wishlist' },
  { value: 'preferences', label: 'Preferences' },
  { value: 'security', label: 'Security and support' },
]

export function CustomerProfile() {
  const { data, error, isLoading } = useAccountProfile()
  const requestedTab = useSearchParams().get('tab')
  const initialTab =
    tabs.find((tab) => tab.value === requestedTab)?.value || 'personal-info'
  const [selection, setSelection] = useState({
    query: initialTab,
    value: initialTab,
  })
  // A new ?tab= destination wins over the selection made on the previous URL.
  const selectedTab =
    selection.query === initialTab ? selection.value : initialTab
  const selectTab = (value: string) =>
    setSelection({ query: initialTab, value })

  if (isLoading)
    return (
      <p role='status' className='px-6 py-12 text-sm'>
        Loading...
      </p>
    )

  const profile = data?.data
  
  if (!profile) {
    return (
      <p role='alert' className='px-6 py-12 text-sm text-destructive'>
        {error?.message || 'Your profile could not be loaded. Try again.'}
      </p>
    )
  }

  return (
    <div className='meere-account px-5 py-10 sm:px-6 sm:py-12'>
      <div className='mx-auto flex max-w-7xl flex-col gap-10 lg:gap-12'>
        <header className='space-y-3'>
          <h1 className='account-title'>My account</h1>
          <p className='text-sm text-muted-foreground'>
            {profileDisplayName(profile)}
          </p>
        </header>

        {error && (
          <p role='alert' className='text-sm text-destructive'>
            {error.message}
          </p>
        )}

        <Tabs
          value={selectedTab}
          onValueChange={selectTab}
          orientation='vertical'
          className='grid items-start gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12'
        >
          <div className='space-y-3 lg:hidden'>
            <Label htmlFor='account-section' className='text-sm font-medium'>
              Account section
            </Label>
            <Select value={selectedTab} onValueChange={selectTab}>
              <SelectTrigger
                id='account-section'
                className='h-12 w-full rounded-none border-gray-300 shadow-none'
                size='lg'
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className={`${generalSans.className} rounded-none`}
              >
                {tabs.map((tab) => (
                  <SelectItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TabsList
            aria-label='Account sections'
            className='hidden h-auto w-full flex-col items-stretch gap-1 rounded-none bg-transparent p-0 lg:flex'
          >
            {tabs.map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className='account-tab'>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className='min-w-0'>
            <TabsContent value='personal-info'>
              <ProfileInformationCard profile={profile} />
            </TabsContent>

            {tabs
              .filter(
                (tab) =>
                  tab.value !== 'personal-info' && tab.value !== 'security',
              )
              .map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <ProfileUnavailable title={tab.label} />
                </TabsContent>
              ))}

            <TabsContent value='security'>
              <ProfileSecurity />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
