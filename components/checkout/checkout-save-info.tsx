'use client'

import { Eye, EyeOff } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCheckout } from '@/stores/hooks/use-checkout'

type CheckoutSaveInfoProps = {
  visible: boolean
}

export function CheckoutSaveInfo({ visible }: CheckoutSaveInfoProps) {
  const {
    createAccount,
    setCreateAccount,
    password,
    setPassword,
    showPassword,
    setShowPassword,
  } = useCheckout()

  if (!visible) return null

  return (
    <Card className='rounded-none border-black/10'>
      <CardHeader className='pb-4 border-b border-black/10'>
        <CardTitle className='text-lg font-semibold flex items-center gap-2'>
          3. Save your information
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-6 space-y-4'>
        <div className='flex items-start gap-3'>
          <input
            id='create-account-checkbox'
            type='checkbox'
            checked={createAccount}
            onChange={(e) => {
              setCreateAccount(e.target.checked)
              if (!e.target.checked) setPassword('')
            }}
            className='size-4 mt-1 accent-black rounded-none cursor-pointer'
          />
          <div className='grid gap-1.5 leading-none'>
            <Label
              htmlFor='create-account-checkbox'
              className='font-semibold cursor-pointer'
            >
              Create an account for exciting offers and easy order tracking
            </Label>
            <p className='text-xs text-muted-foreground'>
              Checking this box will automatically sign you up using the contact details above.
            </p>
          </div>
        </div>

        {createAccount && (
          <div className='flex flex-col gap-1.5 pt-2 max-w-sm'>
            <Label htmlFor='account-password'>Choose Password *</Label>
            <div className='relative flex items-center'>
              <Input
                id='account-password'
                type={showPassword ? 'text' : 'password'}
                className='h-10 rounded-none pr-10'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='At least 6 characters'
                required={createAccount}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 text-muted-foreground hover:text-black cursor-pointer'
              >
                {showPassword ? (
                  <EyeOff className='size-4' />
                ) : (
                  <Eye className='size-4' />
                )}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
