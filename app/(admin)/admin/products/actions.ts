'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/lib/auth/session'
import {
  createProduct,
  deleteProduct,
  deleteProductImages,
  getAdminProductById,
  getProductImageFiles,
  updateProduct,
  uploadProductImages,
} from '@/lib/products/admin-products'
import { createProductSchema } from '@/lib/validations/product'

export type CreateProductActionResult = {
  type: 'error'
  id: string
  message: string
} | null

export type ProductActionResult = CreateProductActionResult

function actionError(message: string): CreateProductActionResult {
  return {
    type: 'error',
    id: crypto.randomUUID(),
    message,
  }
}

function revalidateProductPaths(slug?: string) {
  revalidatePath('/admin/products')
  revalidatePath('/shop')

  if (slug) {
    revalidatePath(`/products/${slug}`)
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

  revalidateProductPaths(parsed.data.slug)
  redirect('/admin/products?message=product created successfully.')
}

export async function updateProductAction(
  productId: string,
  _state: ProductActionResult,
  formData: FormData,
): Promise<ProductActionResult> {
  await requireAdmin()

  const currentProduct = await getAdminProductById(productId)

  if (!currentProduct) {
    return actionError('product not found.')
  }

  let newImageFiles: File[]

  try {
    newImageFiles = getProductImageFiles(formData.getAll('imageFiles'), {
      required: false,
    })
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : 'upload valid product images.',
    )
  }

  const existingImageUrls = formData
    .getAll('existingImageUrls')
    .filter((value): value is string => typeof value === 'string' && Boolean(value))

  const projectedImageUrls = [
    ...existingImageUrls,
    ...newImageFiles.map(() => '/pending-product-image-upload'),
  ]

  if (projectedImageUrls.length === 0) {
    return actionError('keep or upload at least one product image.')
  }

  if (projectedImageUrls.length > 8) {
    return actionError('keep and upload 8 product images or fewer.')
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
    imageSrc: projectedImageUrls[0],
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

  let uploadedImages: Awaited<ReturnType<typeof uploadProductImages>> = []

  if (newImageFiles.length > 0) {
    try {
      uploadedImages = await uploadProductImages(newImageFiles, parsed.data.slug)
    } catch (error) {
      return actionError(
        error instanceof Error ? error.message : 'unable to upload product images.',
      )
    }
  }

  const uploadedImageUrls = uploadedImages.map((image) => image.publicUrl)
  const imageUrls = [...existingImageUrls, ...uploadedImageUrls]
  const previousImageUrls =
    Array.isArray(currentProduct.image_urls) &&
    currentProduct.image_urls.length > 0
      ? currentProduct.image_urls
      : [currentProduct.image_src]
  const removedImageUrls = previousImageUrls.filter(
    (imageUrl) => !existingImageUrls.includes(imageUrl),
  )

  try {
    await updateProduct(productId, {
      ...parsed.data,
      imageSrc: imageUrls[0],
      imageUrls,
    })
  } catch (error) {
    await deleteProductImages(uploadedImages.map((image) => image.path))
    return actionError(
      error instanceof Error ? error.message : 'unable to update product.',
    )
  }

  await deleteProductImages(removedImageUrls)
  revalidateProductPaths(currentProduct.slug)
  revalidateProductPaths(parsed.data.slug)
  redirect(`/admin/products/${productId}?message=product updated successfully.`)
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin()

  const productId = formData.get('productId')

  if (typeof productId !== 'string' || !productId) {
    redirect('/admin/products?error=product not found.')
  }

  const product = await getAdminProductById(productId)

  if (!product) {
    redirect('/admin/products?error=product not found.')
  }

  const productImages =
    Array.isArray(product.image_urls) && product.image_urls.length > 0
      ? product.image_urls
      : [product.image_src]

  try {
    await deleteProduct(productId)
    await deleteProductImages(productImages)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'unable to delete product.'

    redirect(`/admin/products/${productId}?error=${encodeURIComponent(message)}`)
  }

  revalidateProductPaths(product.slug)
  redirect('/admin/products?message=product deleted successfully.')
}
