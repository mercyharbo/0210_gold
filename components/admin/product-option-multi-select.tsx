'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type ProductOptionMultiSelectProps = {
  defaultValue?: string[]
  name: string
  options: readonly string[]
  placeholder: string
}

function formatOptionLabel(option: string) {
  return option
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function ProductOptionMultiSelect({
  defaultValue = [],
  name,
  options,
  placeholder,
}: ProductOptionMultiSelectProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValue)
  const selectedLabel = useMemo(() => {
    if (selectedOptions.length === 0) {
      return placeholder
    }

    if (selectedOptions.length === 1) {
      return formatOptionLabel(selectedOptions[0])
    }

    return `${selectedOptions.length} Selected`
  }, [placeholder, selectedOptions])

  function toggleOption(option: string) {
    setSelectedOptions((currentOptions) =>
      currentOptions.includes(option)
        ? currentOptions.filter((currentOption) => currentOption !== option)
        : [...currentOptions, option],
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {selectedOptions.map((option) => (
        <input key={option} type="hidden" name={name} value={option} />
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(24rem,calc(100vw-2rem))]">
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {options.map((option) => {
              const selected = selectedOptions.includes(option)

              return (
                <button
                  key={option}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted"
                  onClick={() => toggleOption(option)}
                >
                  <Checkbox checked={selected} aria-hidden="true" />
                  <span className="flex-1">{formatOptionLabel(option)}</span>
                  <Check
                    className={cn(
                      'size-4 text-gold',
                      selected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option}
              className="rounded-md bg-gold/10 px-2.5 py-1 text-sm font-medium text-foreground"
            >
              {formatOptionLabel(option)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
