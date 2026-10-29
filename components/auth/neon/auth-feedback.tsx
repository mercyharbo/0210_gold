import { Alert, AlertDescription } from '@/components/ui/alert'

export function AuthFeedback({
  message,
  error = false,
}: {
  message?: string
  error?: boolean
}) {
  if (!message) return null
  return (
    <Alert
      variant={error ? 'destructive' : 'default'}
      role={error ? 'alert' : 'status'}
    >
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
