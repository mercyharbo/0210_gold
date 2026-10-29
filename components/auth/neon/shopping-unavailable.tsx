import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ShoppingUnavailable() {
  return (
    <main className='flex min-h-dvh items-center justify-center bg-muted px-5 py-12'>
      <Card className='w-full max-w-xl'>
        <CardHeader>
          <CardTitle>Shopping is not available in this preview</CardTitle>
          <CardDescription>
            You are testing the new account system. Shopping features will be
            connected in the next migration phases. The regular storefront is
            available through the normal app environment.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-3'>
          <Button asChild><Link href='/auth/preview/account'>My account</Link></Button>
          <Button asChild variant='outline'><Link href='/login'>Sign in</Link></Button>
        </CardContent>
      </Card>
    </main>
  )
}
