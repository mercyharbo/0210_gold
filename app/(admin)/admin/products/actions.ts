'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/lib/auth/session'
import {
  createProduct,
  deleteProductImages,
  getProductImageFiles,
  uploadProductImages,
} from '@/lib/products/admin-products'
import { createProductSchema } from '@/lib/validations/product'

export type CreateProductActionResult = {
  type: 'error'
  id: string
  message: string
} | null

function actionError(message: string): CreateProductActionResult {
  return {
    type: 'error',
    id: crypto.randomUUID(),
    message,
  }
}

export async function createProductAction(
  _state: CreateProductActionResult,
  formData: FormData,
): Promise<CreateProductActionResult> {
  await requireAdmin()

  let imageFiles: File[]

  try {
    imageFiles = getProductImageFiles(formData.getAll('imageFiles'))
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : 'upload at least one product image.',
    )
  }

  const parsed = createProductSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    categoryId: formData.get('categoryId'),
    pricingType: formData.get('pricingType'),
    price: formData.get('price'),
    stock: formData.get('stock'),
    status: formData.get('status'),
    description: formData.get('description'),
    imageSrc: '/pending-product-image-upload',
    imageAlt: formData.get('imageAlt'),
    label: formData.get('label'),
    sizes: formData.getAll('sizes'),
    colors: formData.getAll('colors'),
    details: formData.get('details'),
  })

  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? 'check the product details.',
    )
  }

  let uploadedImages: Awaited<ReturnType<typeof uploadProductImages>>

  try {
    uploadedImages = await uploadProductImages(imageFiles, parsed.data.slug)
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : 'unable to upload product images.',
    )
  }

  const imageUrls = uploadedImages.map((image) => image.publicUrl)

  try {
    await createProduct({
      ...parsed.data,
      imageSrc: imageUrls[0],
      imageUrls,
    })
  } catch (error) {
    await deleteProductImages(uploadedImages.map((image) => image.path))
    return actionError(
      error instanceof Error ? error.message : 'unable to create product.',
    )
  }

  revalidatePath('/admin/products')
  redirect('/admin/products?message=product created successfully.')
}
