'use client'

import { Eye, EyeOff } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<
  ComponentProps<typeof Input>,
  'type'
> & {
  wrapperClassName?: string
}

export function PasswordInput({
  className,
  wrapperClassName,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className={cn('relative', wrapperClassName)}>
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('pr-12', className)}
      />
      <Button
        type='button'
        variant='ghost'
        size='icon'
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((current) => !current)}
        className='absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-none text-muted-foreground hover:bg-black/5 hover:text-black'
      >
        <Icon className='size-4' strokeWidth={1.7} />
      </Button>
    </div>
  )
}
