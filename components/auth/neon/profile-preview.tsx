'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useCurrentProfile } from '@/hooks/use-user-endpoint'
import { useApiRequest } from '@/hooks/use-api-request'
import type { BootstrapBody, IdentityProfile } from '@/types/identity'
import { AuthFeedback } from './auth-feedback'
import { SignOutButton } from './sign-out-button'

export function ProfilePreview() {
  const { data, error, isLoading, mutate } = useCurrentProfile()
  const {
    execute,
    loading,
    error: mutationError,
  } = useApiRequest<IdentityProfile, BootstrapBody>()
  async function initialize() {
    try {
      await execute('post', '/identity/bootstrap', {})
    } catch {
      return
    }
    try {
      await mutate()
    } catch {
      /* SWR exposes refresh errors without repeating the mutation. */
    }
  }
  const profile = data?.data
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your FM LUXE account</CardTitle>
        <CardDescription>
          Authentication preview. Shopping account features will be connected in
          later migration phases.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isLoading && <Skeleton className="h-20 w-full" />}
        {error && <AuthFeedback message={error.message} error />}
        {error && error.status >= 500 && (
          <Button variant='outline' onClick={() => void mutate()}>Try loading my profile again</Button>
        )}
        {mutationError && (
          <AuthFeedback message={mutationError.message} error />
        )}
        {error?.code === 'PROFILE_NOT_INITIALIZED' && (
          <Button disabled={loading} onClick={initialize}>
            {loading ? 'Initializing…' : 'Initialize my profile'}
          </Button>
        )}
        {error?.code === 'EMAIL_NOT_VERIFIED' && (
          <Link
            href="/verify-email"
            className="text-sm underline underline-offset-4"
          >
            Verify your email
          </Link>
        )}
        {profile && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <dt>Name</dt>
            <dd>{profile.name}</dd>
            <dt>Email</dt>
            <dd className="break-all">{profile.email}</dd>
            <dt>Role</dt>
            <dd>{profile.role.replace('_', ' ')}</dd>
          </dl>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-4">
        {profile && ['admin', 'super_admin'].includes(profile.role) && (
          <Button asChild variant="outline">
            <Link href="/auth/preview/admin">Check admin access</Link>
          </Button>
        )}
        <SignOutButton />
      </CardFooter>
    </Card>
  )
}
