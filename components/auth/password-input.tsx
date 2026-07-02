'use client'

import { Eye, EyeOff } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useState } from 'react'

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
        className={cn('pr-12 rounded-none', className)}
      />
      <button
        type='button'
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((current) => !current)}
        className='absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25'
      >
        <Icon className='size-4' strokeWidth={1.7} />
      </button>
    </div>
  )
}
