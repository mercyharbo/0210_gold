'use client'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import {
  accountProfileKey,
  useAccountProfile,
} from '@/hooks/use-account-endpoint'
import { useApiRequest } from '@/hooks/use-api-request'
import { ApiError } from '@/lib/api/client'
import {
  accountProfileSchema,
  changedProfileFields,
  profileFormSchema,
  profileFormValues,
  type ProfileFormValues,
} from '@/lib/validations/account-profile'
import { useToast } from '@/stores/hooks/use-toast'
import type { AccountProfile, ProfilePatch } from '@/types/account'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'

const fields = [
  { name: 'first_name', label: 'First name', autoComplete: 'given-name' },
  { name: 'last_name', label: 'Last name', autoComplete: 'family-name' },
  { name: 'phone', label: 'Phone', autoComplete: 'tel' },
] as const

export function ProfileInformationCard({
  profile,
}: {
  profile: AccountProfile
}) {
  const { toast } = useToast()
  const { cache } = useSWRConfig()
  const { mutate } = useAccountProfile()
  const request = useApiRequest<AccountProfile, ProfilePatch>()
  // Inputs and PATCH feedback are owned by this tab.
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormValues(profile),
    values: profileFormValues(profile),
    resetOptions: { keepDirtyValues: true },
  })
  const {
    register,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = form
  const busy = isSubmitting || request.loading

  async function onSubmit(values: ProfileFormValues) {
    const payload = changedProfileFields(values, profile)
    if (!Object.keys(payload).length) return
    let saved: AccountProfile
    let message: string
    try {
      const response = await request.execute(
        'patch',
        '/account/profile',
        payload,
      )
      const parsed = accountProfileSchema.safeParse(response.data)
      if (!response.success || !parsed.success) {
        toast(
          response.message ||
            'The profile update could not be confirmed. Refresh your profile before trying again.',
          'failure',
        )
        return
      }
      saved = parsed.data
      message = response.message || 'Profile updated successfully.'
    } catch (failure: unknown) {
      if (failure instanceof ApiError && failure.fieldErrors) {
        for (const { name } of fields) {
          const message = failure.fieldErrors[name]?.[0]
          if (message) setError(name, { message })
        }
        const firstInvalid = fields.find(
          ({ name }) => failure.fieldErrors?.[name]?.length,
        )
        if (firstInvalid) form.setFocus(firstInvalid.name)
      }

      toast(
        failure instanceof Error
          ? failure.message
          : 'Unable to update your profile. Try again.',
        'failure',
      )
      return
    }

    form.reset(profileFormValues(saved))
    toast(message, 'success')
    // Refresh the shared GET; a refresh failure is separate from a failed save.
    try {
      await mutate()
      // SWR records GET failures in its cache instead of always rejecting mutate().
      const refreshError = cache.get(accountProfileKey)?.error
      if (refreshError) throw refreshError
    } catch {
      toast(
        'Your profile was saved, but refreshing it failed. Refresh the page to check the latest details.',
        'warning',
      )
    }
  }

  return (
    <section aria-labelledby='profile-information-title' className='account-profile-section'>
      <header className='space-y-2'>
        <h2 id='profile-information-title' className='account-section-title'>Personal information</h2>
        <p className='text-sm text-muted-foreground'>Update your contact details for delivery and order support.</p>
      </header>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-5'
      >
        <FieldGroup className='grid gap-4 sm:grid-cols-2'>
          {fields.map(({ name, label, autoComplete }) => (
            <Field
              key={name}
              data-invalid={!!errors[name]}
              className={name === 'phone' ? 'sm:col-span-2' : undefined}
            >
              <FieldLabel htmlFor={`profile-${name}`}>{label}</FieldLabel>
              <Input
                id={`profile-${name}`}
                type={name === 'phone' ? 'tel' : 'text'}
                autoComplete={autoComplete}
                placeholder={name === 'phone' ? '+234...' : 'Not provided'}
                readOnly={busy}
                aria-invalid={!!errors[name]}
                aria-describedby={
                  errors[name] ? `profile-${name}-error` : undefined
                }
                {...register(name)}
              />
              <FieldError
                id={`profile-${name}-error`}
                errors={[errors[name]]}
              />
            </Field>
          ))}
          <Field className='sm:col-span-2'>
            <FieldLabel htmlFor='profile-email'>Email address</FieldLabel>
            <Input
              id='profile-email'
              value={profile.email}
              readOnly
              disabled
              aria-describedby='profile-email-help'
            />
            <FieldDescription id='profile-email-help'>
              Email is managed by your login account.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <p className='text-sm text-muted-foreground'>
          Customer since{' '}
          {new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'medium',
            timeZone: 'UTC',
          }).format(new Date(profile.created_at))}
        </p>
        <Button
          type='submit'
          disabled={busy || !Object.keys(dirtyFields).length}
          aria-busy={busy}
          className='w-full'
        >
          {busy ? (
            <>
              <Spinner /> Saving profile...
            </>
          ) : (
            'Save profile'
          )}
        </Button>
      </form>
    </section>
  )
}
