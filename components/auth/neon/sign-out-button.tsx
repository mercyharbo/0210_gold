'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { useApiRequest } from '@/hooks/use-api-request'
import { isUserScopedKey, resetSessionUi } from '@/lib/auth/client-session'
import type { LogoutResult } from '@/types/authentication'

export function SignOutButton() {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { execute } = useApiRequest<LogoutResult>()
  const { handleSubmit, setError, formState: { errors, isSubmitting } } = useForm()
  const submit = handleSubmit(async () => {
    try {
      await execute('post', '/auth/logout')
    } catch (error: unknown) {
      setError('root', { message: error instanceof Error ? error.message : 'Sign out failed. Try again.' })
      return
    }
    resetSessionUi()
    try { await mutate(isUserScopedKey, undefined, { revalidate: false }) } catch { /* Navigation reloads private data. */ }
    router.replace('/login')
    router.refresh()
  })
  return (
    <form onSubmit={submit} className='flex flex-col gap-3'>
      <Button type='submit' variant='outline' disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Signing out…' : 'Sign out'}
      </Button>
      <FieldError errors={[errors.root]} />
    </form>
  )
}
