import { createSupabaseServerClient } from '@/lib/supabase/server'
import type {
  AdminProductListItem,
  CreateProductInput,
  ProductPricingType,
  UpdateProductInput,
} from '@/types/product'

const productImageBucket = 'product-media'
const maxProductImageSize = 5 * 1024 * 1024
const maxProductImageCount = 8
const allowedProductImageTypes = new Set([
  'image/avif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const productImageExtensions: Record<string, string> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const priceFormatter = new Intl.NumberFormat('en-NG', {
  maximumFractionDigits: 0,
})

function normalizeStorageSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getProductImageUploadErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('bucket') ||
    normalizedMessage.includes('not found')
  ) {
    return 'product media storage is not ready. run supabase/07-product-media-storage.sql, then try again.'
  }

  if (
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('policy') ||
    normalizedMessage.includes('unauthorized') ||
    normalizedMessage.includes('permission')
  ) {
    return 'your admin account is not allowed to upload product images. check the product media storage policies.'
  }

  return `image upload failed: ${message}`
}

function getProductWriteErrorMessage(error: { code?: string; message: string }) {
  const normalizedMessage = error.message.toLowerCase()

  if (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    normalizedMessage.includes('image_urls') ||
    normalizedMessage.includes('schema cache')
  ) {
    return 'product image gallery storage is not ready. run supabase/08-product-image-gallery.sql, then refresh the supabase schema cache and try again.'
  }

  if (error.code === '23505') {
    return 'a product with this slug already exists.'
  }

  return `unable to save product: ${error.message}`
}

function getProductImageStoragePath(pathOrUrl: string) {
  if (!pathOrUrl.startsWith('http')) {
    return pathOrUrl.startsWith('products/') ? pathOrUrl : null
  }

  const marker = `/${productImageBucket}/`
  const markerIndex = pathOrUrl.indexOf(marker)

  if (markerIndex === -1) {
    return null
  }

  return decodeURIComponent(pathOrUrl.slice(markerIndex + marker.length))
}

export function formatAdminProductPrice(
  pricingType: ProductPricingType,
  price: number | null,
) {
  if (pricingType === 'price_on_request') {
    return 'price on request'
  }

  if (price === null) {
    return 'price on request'
  }

  const formattedPrice = `\u20a6${priceFormatter.format(price)}`

  return pricingType === 'starting_from'
    ? `from ${formattedPrice}`
    : formattedPrice
}

export function getProductImageFiles(
  values: FormDataEntryValue[],
  options: { required?: boolean } = {},
) {
  const required = options.required ?? true
  const files = values.filter(
    (value): value is File => value instanceof File && value.size > 0,
  )

  if (required && files.length === 0) {
    throw new Error('upload at least one product image.')
  }

  if (files.length > maxProductImageCount) {
    throw new Error(`upload ${maxProductImageCount} product images or fewer.`)
  }

  for (const file of files) {
    if (!allowedProductImageTypes.has(file.type)) {
      throw new Error('upload avif, jpeg, png, or webp product images.')
    }

    if (file.size > maxProductImageSize) {
      throw new Error('each product image must be 5mb or smaller.')
    }
  }

  return files
}

export async function uploadProductImages(files: File[], slug: string) {
  const uploadedImages: Awaited<ReturnType<typeof uploadProductImage>>[] = []

  try {
    for (const file of files) {
      uploadedImages.push(await uploadProductImage(file, slug))
    }
  } catch (error) {
    await deleteProductImages(uploadedImages.map((image) => image.path))
    throw error
  }

  return uploadedImages
}

export async function uploadProductImage(file: File, slug: string) {
  const supabase = await createSupabaseServerClient()
  const safeSlug = normalizeStorageSegment(slug) || 'product'
  const extension = productImageExtensions[file.type] ?? 'jpg'
  const path = `products/${safeSlug}/${crypto.randomUUID()}.${extension}`

  const { data, error } = await supabase.storage
    .from(productImageBucket)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('product image upload failed:', {
      message: error.message,
    })

    throw new Error(getProductImageUploadErrorMessage(error.message))
  }

  const { data: publicUrlData } = supabase.storage
    .from(productImageBucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  }
}

export async function deleteProductImages(paths: string[]) {
  const storagePaths = paths
    .map(getProductImageStoragePath)
    .filter((path): path is string => Boolean(path))

  if (storagePaths.length === 0) {
    return
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.storage
    .from(productImageBucket)
    .remove(storagePaths)

  if (error) {
    console.error('product image cleanup failed:', {
      message: error.message,
      paths: storagePaths,
    })
  }
}

export async function getAdminProducts() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `
        *,
        category:categories (
          name,
          slug
        )
      `,
    )
    .order('created_at', { ascending: false })
    .returns<AdminProductListItem[]>()

  if (error) {
    console.error('admin products read failed:', {
      code: error.code,
      message: error.message,
    })

    return []
  }

  return data ?? []
}

export async function getAdminProductById(productId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      `
        *,
        category:categories (
          name,
          slug
        )
      `,
    )
    .eq('id', productId)
    .returns<AdminProductListItem[]>()
    .single()

  if (error) {
    console.error('admin product read failed:', {
      code: error.code,
      message: error.message,
      productId,
    })

    return null
  }

  return data
}

export async function createProduct(input: CreateProductInput) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('products').insert({
    name: input.name,
    slug: input.slug,
    category_id: input.categoryId,
    pricing_type: input.pricingType,
    price: input.price,
    stock: input.stock,
    status: input.status,
    description: input.description,
    image_src: input.imageSrc,
    image_urls: input.imageUrls,
    image_alt: input.imageAlt,
    label: input.label,
    sizes: input.sizes,
    colors: input.colors,
    details: input.details,
  })

  if (error) {
    console.error('product create failed:', {
      code: error.code,
      message: error.message,
    })

    throw new Error(getProductWriteErrorMessage(error))
  }
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('products')
    .update({
      name: input.name,
      slug: input.slug,
      category_id: input.categoryId,
      pricing_type: input.pricingType,
      price: input.price,
      stock: input.stock,
      status: input.status,
      description: input.description,
      image_src: input.imageSrc,
      image_urls: input.imageUrls,
      image_alt: input.imageAlt,
      label: input.label,
      sizes: input.sizes,
      colors: input.colors,
      details: input.details,
    })
    .eq('id', productId)

  if (error) {
    console.error('product update failed:', {
      code: error.code,
      message: error.message,
      productId,
    })

    throw new Error(getProductWriteErrorMessage(error))
  }
}

export async function deleteProduct(productId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) {
    console.error('product delete failed:', {
      code: error.code,
      message: error.message,
      productId,
    })

    throw new Error(`unable to delete product: ${error.message}`)
  }
}
