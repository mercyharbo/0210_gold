'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import {
  createHeroBanner,
  deleteHeroBanner,
  deleteBannerImage,
  getAdminHeroBannerById,
  getBannerImageFile,
  updateHeroBanner,
  uploadBannerImage,
} from '@/lib/hero-banners/admin-hero-banners'
import { heroBannerFormSchema } from '@/lib/validations/hero-banner'

export type BannerActionResult = {
  type: 'error'
  id: string
  message: string
} | null

function actionError(message: string): BannerActionResult {
  return {
    type: 'error',
    id: crypto.randomUUID(),
    message,
  }
}

function revalidateBannerPaths() {
  revalidatePath('/admin/hero-banners')
  revalidatePath('/')
}

export async function createHeroBannerAction(
  _state: BannerActionResult,
  formData: FormData,
): Promise<BannerActionResult> {
  await requireAdmin()

  let imageFile: File | null
  try {
    imageFile = getBannerImageFile(formData.get('imageFile'))
  } catch (error) {
    return actionError(error instanceof Error ? error.message : 'Invalid image file.')
  }

  if (!imageFile) {
    return actionError('Upload a banner image.')
  }

  const parsed = heroBannerFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    imageSrc: '/pending-image-upload', // Temporary string to pass Zod schema
    route: formData.get('route'),
    isActive: formData.get('isActive'),
    sortOrder: formData.get('sortOrder'),
  })

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? 'Invalid banner details.')
  }

  let uploadedImage: Awaited<ReturnType<typeof uploadBannerImage>>
  try {
    uploadedImage = await uploadBannerImage(imageFile, parsed.data.title)
  } catch (error) {
    return actionError(error instanceof Error ? error.message : 'Banner image upload failed.')
  }

  try {
    await createHeroBanner({
      ...parsed.data,
      imageSrc: uploadedImage.publicUrl,
    })
  } catch (error) {
    await deleteBannerImage(uploadedImage.path)
    return actionError(error instanceof Error ? error.message : 'Unable to create banner.')
  }

  revalidateBannerPaths()
  redirect('/admin/hero-banners?message=Banner created successfully.')
}

export async function updateHeroBannerAction(
  bannerId: string,
  _state: BannerActionResult,
  formData: FormData,
): Promise<BannerActionResult> {
  await requireAdmin()

  const currentBanner = await getAdminHeroBannerById(bannerId)
  if (!currentBanner) {
    return actionError('Banner not found.')
  }

  let imageFile: File | null
  try {
    imageFile = getBannerImageFile(formData.get('imageFile'))
  } catch (error) {
    return actionError(error instanceof Error ? error.message : 'Invalid image file.')
  }

  const existingImageSrc = formData.get('existingImageSrc')
  const projectedImageSrc = imageFile ? '/pending-image-upload' : (typeof existingImageSrc === 'string' ? existingImageSrc : '')

  if (!projectedImageSrc) {
    return actionError('A banner image is required.')
  }

  const parsed = heroBannerFormSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    imageSrc: projectedImageSrc,
    route: formData.get('route'),
    isActive: formData.get('isActive'),
    sortOrder: formData.get('sortOrder'),
  })

  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? 'Invalid banner details.')
  }

  let uploadedImage: Awaited<ReturnType<typeof uploadBannerImage>> | null = null
  if (imageFile) {
    try {
      uploadedImage = await uploadBannerImage(imageFile, parsed.data.title)
    } catch (error) {
      return actionError(error instanceof Error ? error.message : 'Banner image upload failed.')
    }
  }

  const imageSrc = uploadedImage ? uploadedImage.publicUrl : currentBanner.image_src

  try {
    await updateHeroBanner(bannerId, {
      ...parsed.data,
      imageSrc,
    })
  } catch (error) {
    if (uploadedImage) {
      await deleteBannerImage(uploadedImage.path)
    }
    return actionError(error instanceof Error ? error.message : 'Unable to update banner.')
  }

  if (imageFile && currentBanner.image_src) {
    await deleteBannerImage(currentBanner.image_src)
  }

  revalidateBannerPaths()
  redirect(`/admin/hero-banners/${bannerId}?message=Banner updated successfully.`)
}

export async function deleteHeroBannerAction(formData: FormData) {
  await requireAdmin()

  const bannerId = formData.get('bannerId')
  if (typeof bannerId !== 'string' || !bannerId) {
    redirect('/admin/hero-banners?error=Banner not found.')
  }

  const banner = await getAdminHeroBannerById(bannerId)
  if (!banner) {
    redirect('/admin/hero-banners?error=Banner not found.')
  }

  try {
    await deleteHeroBanner(bannerId)
    if (banner.image_src) {
      await deleteBannerImage(banner.image_src)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete banner.'
    redirect(`/admin/hero-banners/${bannerId}?error=${encodeURIComponent(message)}`)
  }

  revalidateBannerPaths()
  redirect('/admin/hero-banners?message=Banner deleted successfully.')
}
