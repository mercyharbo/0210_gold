'use client'

import { useFormStatus } from 'react-dom'

import { updateProfileDetails } from '@/app/(index)/profile/actions'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { CustomerProfile } from '@/types/profile'

const fieldInputClassName = 'h-11'

type ProfileInformationCardProps = {
  profile: CustomerProfile
  fallbackEmail?: string
}

function SaveProfileButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' disabled={pending}>
      {pending ? (
        <>
          <Spinner className='size-4' />
          Saving profile
        </>
      ) : (
        'Save profile'
      )}
    </Button>
  )
}

export function ProfileInformationCard({
  profile,
  fallbackEmail,
}: ProfileInformationCardProps) {
  return (
    <section className='h-fit border border-black/10 p-6 sm:p-8'>
      <p className='text-xs font-semibold uppercase text-black/45'>
        Account details
      </p>
      <h2 className='mt-2 font-heading text-3xl font-semibold'>
        Profile information
      </h2>
      <p className='mt-3 text-sm leading-6 text-black/58'>
        Keep your customer profile current for delivery, support, and personal
        shopping updates.
      </p>

      <form action={updateProfileDetails} className='mt-6 space-y-5'>
        <FieldGroup className='grid gap-4 sm:grid-cols-2'>
          <Field>
            <FieldLabel htmlFor='firstName'>First name</FieldLabel>
            <Input
              id='firstName'
              name='firstName'
              defaultValue={profile.first_name ?? ''}
              className={fieldInputClassName}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='lastName'>Last name</FieldLabel>
            <Input
              id='lastName'
              name='lastName'
              defaultValue={profile.last_name ?? ''}
              className={fieldInputClassName}
              required
            />
          </Field>
          <Field className='sm:col-span-2'>
            <FieldLabel htmlFor='profileEmail'>Email</FieldLabel>
            <Input
              id='profileEmail'
              value={profile.email ?? fallbackEmail ?? ''}
              className={fieldInputClassName}
              disabled
            />
            <FieldDescription>
              Email is managed from your login account.
            </FieldDescription>
          </Field>
          <Field className='sm:col-span-2'>
            <FieldLabel htmlFor='phone'>Phone</FieldLabel>
            <Input
              id='phone'
              name='phone'
              defaultValue={profile.phone ?? ''}
              placeholder='+234...'
              className={fieldInputClassName}
            />
          </Field>
          <Field className='sm:col-span-2'>
            <FieldLabel htmlFor='preferences'>Preferences</FieldLabel>
            <Input
              id='preferences'
              name='preferences'
              defaultValue={profile.preferences.join(', ')}
              placeholder='Gold jewellery, abaya, bags'
              className={fieldInputClassName}
            />
            <FieldDescription>Separate preferences with commas.</FieldDescription>
          </Field>
        </FieldGroup>

        <SaveProfileButton />
      </form>
    </section>
  )
}
