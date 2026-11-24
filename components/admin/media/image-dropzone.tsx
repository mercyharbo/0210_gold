'use client'

import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ImageDropzoneProps = {
  disabled: boolean
  replacing: boolean
  invalid: boolean
  onSelect: (files: FileList | null) => void
  inputId?: string
  multiple?: boolean
}

export function ImageDropzone({ disabled, replacing, invalid, onSelect, inputId = 'category-image', multiple = false }: ImageDropzoneProps) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  return (
    <>
      <Button
        type='button'
        id={`${inputId}-button`}
        variant='outline'
        disabled={disabled}
        aria-describedby={`${inputId}-help`}
        aria-invalid={invalid}
        className={cn(
          'h-auto w-full gap-3 whitespace-normal rounded-md border border-dashed border-gray-300 bg-gray-50/50 text-sm font-normal hover:border-gold hover:bg-gold/5',
          replacing ? 'min-h-20 px-4 py-4' : 'min-h-36 flex-col px-4 py-6',
          dragging && !disabled && 'border-gold bg-gold/5',
        )}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = disabled ? 'none' : 'copy'
          if (!disabled) setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (!disabled) onSelect(event.dataTransfer.files)
        }}
      >
        <ImagePlus className={replacing ? 'size-5 text-gray-500' : 'size-6 text-gray-500'} aria-hidden='true' />
        <span>Drop {replacing ? 'a replacement' : multiple ? 'your images' : 'your image'} here, or <span className='font-medium text-gold underline underline-offset-4'>browse files</span></span>
      </Button>
      <p id={`${inputId}-help`} className='text-xs text-gray-600'>{multiple ? 'Up to 8 JPEG, PNG, WebP or AVIF images, up to 5 MB each.' : 'One JPEG, PNG, WebP or AVIF image, up to 5 MB.'}</p>
      <Input
        id={inputId}
        ref={input}
        type='file'
        multiple={multiple}
        className='hidden'
        tabIndex={-1}
        disabled={disabled}
        aria-invalid={invalid}
        accept='image/jpeg,image/png,image/webp,image/avif'
        onChange={(event) => {
          onSelect(event.target.files)
          event.target.value = ''
        }}
      />
    </>
  )
}
