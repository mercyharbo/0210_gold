'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AuthPreviewError({ reset }: { reset: () => void }) {
  return (
    <Alert>
      <AlertTitle>Account services are temporarily unavailable</AlertTitle>
      <AlertDescription>
        <p>Please try loading your account again.</p>
        <Button variant='outline' onClick={reset}>Try again</Button>
      </AlertDescription>
    </Alert>
  )
}
