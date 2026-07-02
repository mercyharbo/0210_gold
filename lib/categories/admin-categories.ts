import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { AdminCategory, Category } from '@/types/category'

export type CategoryFormInput = {
  name: string
  slug: string
  categoryType: string
  description: string | null
  imageSrc: string | null
  imageAlt: string | null
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  featuredSortOrder: number
}

const categoryImageBucket = 'category-media'
const maxCategoryImageSize = 5 * 1024 * 1024
const allowedCategoryImageTypes = new Set([
  'image/avif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const categoryImageExtensions: Record<string, string> = {
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function normalizeStorageSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getCategoryImageUploadErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes('bucket') ||
    normalizedMessage.includes('not found')
  ) {
    return 'category media storage is not ready. run the category featured cards migration, then try again.'
  }

  if (
    normalizedMessage.includes('row-level security') ||
    normalizedMessage.includes('policy') ||
    normalizedMessage.includes('unauthorized') ||
    normalizedMessage.includes('permission')
  ) {
    return 'your admin account is not allowed to upload category images. check the category media storage policies.'
  }

  return `category image upload failed: ${message}`
}

function getCategoryWriteErrorMessage(error: { code?: string; message: string }) {
  const normalizedMessage = error.message.toLowerCase()

  if (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    normalizedMessage.includes('category_type') ||
    normalizedMessage.includes('is_featured') ||
    normalizedMessage.includes('featured_sort_order') ||
    normalizedMessage.includes('schema cache')
  ) {
    return 'category storefront fields are not ready. run the category featured cards migration, then refresh the supabase schema cache and try again.'
  }

  if (error.code === '23505') {
    return 'a category with this slug already exists.'
  }

  return `unable to save category: ${error.message}`
}

function getStoragePathFromPublicUrl(url: string | null) {
  if (!url) {
    return null
  }

  const marker = `/storage/v1/object/public/${categoryImageBucket}/`
  const markerIndex = url.indexOf(marker)

  if (markerIndex === -1) {
    return null
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length))
}

export function getCategoryImageFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null
  }

  if (!allowedCategoryImageTypes.has(value.type)) {
    throw new Error('upload an avif, jpeg, png, or webp category image.')
  }

  if (value.size > maxCategoryImageSize) {
    throw new Error('category image must be 5mb or smaller.')
  }

  return value
}

export async function uploadCategoryImage(file: File, slug: string) {
  const supabase = await createSupabaseServerClient()
  const safeSlug = normalizeStorageSegment(slug) || 'category'
  const extension = categoryImageExtensions[file.type] ?? 'jpg'
  const path = `categories/${safeSlug}/${crypto.randomUUID()}.${extension}`

  const { data, error } = await supabase.storage
    .from(categoryImageBucket)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('category image upload failed:', {
      message: error.message,
    })

    throw new Error(getCategoryImageUploadErrorMessage(error.message))
  }

  const { data: publicUrlData } = supabase.storage
    .from(categoryImageBucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  }
}

export async function deleteCategoryImage(pathOrUrl: string | null) {
  const path = pathOrUrl?.startsWith('http')
    ? getStoragePathFromPublicUrl(pathOrUrl)
    : pathOrUrl

  if (!path) {
    return
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.storage
    .from(categoryImageBucket)
    .remove([path])

  if (error) {
    console.error('category image cleanup failed:', {
      message: error.message,
      path,
    })
  }
}

async function getProductCountsByCategory() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('category_id')
    .not('category_id', 'is', null)

  if (error) {
    console.error('category product counts read failed:', {
      code: error.code,
      message: error.message,
    })

    return new Map<string, number>()
  }

  return (data ?? []).reduce((counts, product) => {
    const categoryId = product.category_id as string | null

    if (categoryId) {
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1)
    }

    return counts
  }, new Map<string, number>())
}

export async function getAdminCategories() {
  const supabase = await createSupabaseServerClient()
  const [productCountsResult, categoriesResult] = await Promise.all([
    getProductCountsByCategory(),
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
      .returns<Category[]>(),
  ])

  if (categoriesResult.error) {
    console.error('admin categories read failed:', {
      code: categoriesResult.error.code,
      message: categoriesResult.error.message,
    })

    return []
  }

  return (categoriesResult.data ?? []).map((category) => ({
    ...category,
    product_count: productCountsResult.get(category.id) ?? 0,
  })) satisfies AdminCategory[]
}

export async function getAdminCategoryById(categoryId: string) {
  const supabase = await createSupabaseServerClient()
  const [productCountsResult, categoryResult] = await Promise.all([
    getProductCountsByCategory(),
    supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .returns<Category[]>()
      .single(),
  ])

  if (categoryResult.error) {
    console.error('admin category read failed:', {
      code: categoryResult.error.code,
      message: categoryResult.error.message,
      categoryId,
    })

    return null
  }

  return {
    ...categoryResult.data,
    product_count: productCountsResult.get(categoryResult.data.id) ?? 0,
  } satisfies AdminCategory
}

export async function createCategory(input: CategoryFormInput) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('categories').insert({
    name: input.name,
    slug: input.slug,
    category_type: input.categoryType,
    description: input.description,
    image_src: input.imageSrc,
    image_alt: input.imageAlt,
    is_active: input.isActive,
    is_featured: input.isFeatured,
    sort_order: input.sortOrder,
    featured_sort_order: input.featuredSortOrder,
  })

  if (error) {
    console.error('category create failed:', {
      code: error.code,
      message: error.message,
    })

    throw new Error(getCategoryWriteErrorMessage(error))
  }
}

export async function updateCategory(categoryId: string, input: CategoryFormInput) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('categories')
    .update({
      name: input.name,
      slug: input.slug,
      category_type: input.categoryType,
      description: input.description,
      image_src: input.imageSrc,
      image_alt: input.imageAlt,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      sort_order: input.sortOrder,
      featured_sort_order: input.featuredSortOrder,
    })
    .eq('id', categoryId)

  if (error) {
    console.error('category update failed:', {
      code: error.code,
      message: error.message,
      categoryId,
    })

    throw new Error(getCategoryWriteErrorMessage(error))
  }
}

export async function deleteCategory(category: AdminCategory) {
  if (category.product_count > 0) {
    throw new Error('move or delete products in this category before deleting it.')
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', category.id)

  if (error) {
    console.error('category delete failed:', {
      code: error.code,
      message: error.message,
      categoryId: category.id,
    })

    throw new Error(`unable to delete category: ${error.message}`)
  }
}
