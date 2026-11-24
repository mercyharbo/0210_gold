import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function ApiFeedback({ message, error = false, onRetry, isRetrying = false }: {
  message?: string
  error?: boolean
  onRetry?: () => void
  isRetrying?: boolean
}) {
  if (!message) {
    return null
  }

  return (
    <Alert role={error ? 'alert' : 'status'} variant={error ? 'destructive' : 'default'}>
      <AlertDescription className='flex flex-col items-start gap-3'>
        <p>{message}</p>

        {onRetry && (
          <Button type='button' variant='outline' size='sm' disabled={isRetrying} onClick={onRetry}>
            {isRetrying ? 'Retrying...' : 'Try again'}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
