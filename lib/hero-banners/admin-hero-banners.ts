import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { HeroBanner } from '@/types/hero-banner'

export type HeroBannerFormInput = {
  title: string
  description: string
  imageSrc: string
  route: string
  isActive: boolean
  sortOrder: number
}

const bannerImageBucket = 'banner-media'
const maxBannerImageSize = 8 * 1024 * 1024 // Allow up to 8MB for large hero banner images
const allowedBannerImageTypes = new Set([
  'image/avif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const bannerImageExtensions: Record<string, string> = {
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

function getBannerImageUploadErrorMessage(message: string) {
  return `Banner image upload failed: ${message}`
}

function getBannerWriteErrorMessage(error: { code?: string; message: string }) {
  return `Unable to save banner: ${error.message}`
}

function getStoragePathFromPublicUrl(url: string | null) {
  if (!url) {
    return null
  }

  const marker = `/storage/v1/object/public/${bannerImageBucket}/`
  const markerIndex = url.indexOf(marker)

  if (markerIndex === -1) {
    return null
  }

  return decodeURIComponent(url.slice(markerIndex + marker.length))
}

export function getBannerImageFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null
  }

  if (!allowedBannerImageTypes.has(value.type)) {
    throw new Error('Upload an avif, jpeg, png, or webp banner image.')
  }

  if (value.size > maxBannerImageSize) {
    throw new Error('Banner image must be 8MB or smaller.')
  }

  return value
}

export async function uploadBannerImage(file: File, title: string) {
  const supabase = await createSupabaseServerClient()
  const safeTitle = normalizeStorageSegment(title) || 'banner'
  const extension = bannerImageExtensions[file.type] ?? 'jpg'
  const path = `banners/${safeTitle}/${crypto.randomUUID()}.${extension}`

  const { data, error } = await supabase.storage
    .from(bannerImageBucket)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('Banner image upload failed:', {
      message: error.message,
    })
    throw new Error(getBannerImageUploadErrorMessage(error.message))
  }

  const { data: publicUrlData } = supabase.storage
    .from(bannerImageBucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  }
}

export async function deleteBannerImage(pathOrUrl: string | null) {
  const path = pathOrUrl?.startsWith('http')
    ? getStoragePathFromPublicUrl(pathOrUrl)
    : pathOrUrl

  if (!path) {
    return
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.storage
    .from(bannerImageBucket)
    .remove([path])

  if (error) {
    console.error('Banner image cleanup failed:', {
      message: error.message,
      path,
    })
  }
}

export async function getAdminHeroBanners() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .returns<HeroBanner[]>()

  if (error) {
    console.error('Admin hero banners read failed:', {
      code: error.code,
      message: error.message,
    })
    return []
  }

  return data ?? []
}

export async function getAdminHeroBannerById(bannerId: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('id', bannerId)
    .returns<HeroBanner[]>()
    .single()

  if (error) {
    console.error('Admin hero banner read failed:', {
      code: error.code,
      message: error.message,
      bannerId,
    })
    return null
  }

  return data
}

export async function createHeroBanner(input: HeroBannerFormInput) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from('hero_banners').insert({
    title: input.title,
    description: input.description,
    image_src: input.imageSrc,
    route: input.route,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  })

  if (error) {
    console.error('Banner create failed:', {
      code: error.code,
      message: error.message,
    })
    throw new Error(getBannerWriteErrorMessage(error))
  }
}

export async function updateHeroBanner(bannerId: string, input: HeroBannerFormInput) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('hero_banners')
    .update({
      title: input.title,
      description: input.description,
      image_src: input.imageSrc,
      route: input.route,
      is_active: input.isActive,
      sort_order: input.sortOrder,
    })
    .eq('id', bannerId)

  if (error) {
    console.error('Banner update failed:', {
      code: error.code,
      message: error.message,
      bannerId,
    })
    throw new Error(getBannerWriteErrorMessage(error))
  }
}

export async function deleteHeroBanner(bannerId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('hero_banners')
    .delete()
    .eq('id', bannerId)

  if (error) {
    console.error('Banner delete failed:', {
      code: error.code,
      message: error.message,
      bannerId,
    })
    throw new Error(`Unable to delete banner: ${error.message}`)
  }
}
