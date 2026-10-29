'use client'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminCheck } from '@/hooks/use-user-endpoint'
import { AuthFeedback } from './auth-feedback'

export function AdminPreview() {
  const { data, error, isLoading } = useAdminCheck(true)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrator access</CardTitle>
        <CardDescription>
          Permissions are checked by FastAPI against your application role.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-12 w-full" />}
        <AuthFeedback message={error?.message} error />
        {data?.data && (
          <AuthFeedback message={`Access confirmed for ${data.data.email}.`} />
        )}
      </CardContent>
    </Card>
  )
}
