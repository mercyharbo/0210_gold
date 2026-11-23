import type { ComponentProps } from 'react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

type ConfirmationCodeInputProps = Omit<ComponentProps<typeof InputOTP>, 'maxLength' | 'children' | 'render'>

export function ConfirmationCodeInput(props: ConfirmationCodeInputProps) {
  return (
    <InputOTP {...props} maxLength={6} pattern={REGEXP_ONLY_DIGITS} inputMode='numeric'
      autoComplete='one-time-code' containerClassName='grid w-full max-w-72 grid-cols-6 gap-2'>
      {Array.from({ length: 6 }, (_, index) => (
        <InputOTPGroup key={index} className='rounded-md'>
          <InputOTPSlot index={index} aria-invalid={props['aria-invalid']}
            className='aspect-square size-auto w-full rounded-md border text-base first:rounded-l-md last:rounded-r-md' />
        </InputOTPGroup>
      ))}
    </InputOTP>
  )
}
