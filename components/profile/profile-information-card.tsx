'use client'

import { useFormStatus } from 'react-dom'

import { updateProfileDetails } from '@/app/(index)/profile/actions'
import { CategoryPreferencesMultiSelect } from '@/components/profile/category-preferences-multi-select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { CategoryOption } from '@/types/category'
import type { CustomerProfile } from '@/types/profile'

const fieldInputClassName = 'h-11'

type ProfileInformationCardProps = {
  profile: CustomerProfile
  categories: CategoryOption[]
  selectedCategoryIds: string[]
  fallbackEmail?: string
}

function SaveProfileButton() {
  const { pending } = useFormStatus()

  return (
    <Button type='submit' className='w-full' disabled={pending}>
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
  categories,
  selectedCategoryIds,
  fallbackEmail,
}: ProfileInformationCardProps) {
  return (
    <Card className='h-fit [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]'>
      <CardHeader className='gap-3'>
        <div className='space-y-2'>
          <p className='text-xs font-semibold uppercase text-muted-foreground'>
            Account details
          </p>
          <CardTitle className='text-3xl font-semibold'>
            Profile information
          </CardTitle>
        </div>
        <CardDescription className='max-w-xl leading-6 text-muted-foreground'>
          Keep your customer profile current for delivery, support, and personal
          shopping updates.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={updateProfileDetails} className='space-y-5'>
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
              <CategoryPreferencesMultiSelect
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
              />
            </Field>
          </FieldGroup>

          <SaveProfileButton />
        </form>
      </CardContent>
    </Card>
  )
}
