import { Alert, AlertDescription } from '@/components/ui/alert'

export function CatalogFeedback({ message, error = false }: { message?: string; error?: boolean }) {
  if (!message) return null
  return (
    <Alert role={error ? 'alert' : 'status'} variant={error ? 'destructive' : 'default'}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
