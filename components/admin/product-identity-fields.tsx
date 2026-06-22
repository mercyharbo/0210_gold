'use client'

import { useState } from 'react'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ProductIdentityFields() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function updateName(nextName: string) {
    setName(nextName)

    if (!slugEdited) {
      setSlug(createSlug(nextName))
    }
  }

  function updateSlug(nextSlug: string) {
    setSlugEdited(true)
    setSlug(createSlug(nextSlug))
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Field>
        <FieldLabel htmlFor='name'>Product Name</FieldLabel>
        <Input
          id='name'
          name='name'
          required
          value={name}
          onChange={(event) => updateName(event.target.value)}
          className='h-11'
          placeholder='18k Gold Figarope Chain'
        />
      </Field>
      <Field>
        <FieldLabel htmlFor='slug'>Slug</FieldLabel>
        <Input
          id='slug'
          name='slug'
          required
          value={slug}
          onChange={(event) => updateSlug(event.target.value)}
          className='h-11'
          placeholder='18k-gold-figarope-chain'
        />
        <FieldDescription>
          Auto-created from the product name until edited manually.
        </FieldDescription>
      </Field>
    </div>
  )
}
