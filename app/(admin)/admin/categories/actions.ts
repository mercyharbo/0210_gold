'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdmin } from '@/lib/auth/session'
import {
  createCategory,
  deleteCategory,
  deleteCategoryImage,
  getAdminCategoryById,
  getCategoryImageFile,
  updateCategory,
  uploadCategoryImage,
} from '@/lib/categories/admin-categories'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { categoryFormSchema } from '@/lib/validations/category'

export type CategoryActionResult = {
  type: 'error'
  id: string
  message: string
} | null

function actionError(message: string): CategoryActionResult {
  return {
    type: 'error',
    id: crypto.randomUUID(),
    message,
  }
}

function revalidateCategoryPaths() {
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/shop')
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products/new')
}

function getFormValues(formData: FormData, imageSrc: string | null) {
  return categoryFormSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    categoryType: formData.get('categoryType'),
    description: formData.get('description'),
    imageSrc,
    imageAlt: formData.get('imageAlt'),
    isActive: formData.get('isActive'),
    isFeatured: formData.get('isFeatured'),
    sortOrder: formData.get('sortOrder'),
    featuredSortOrder: formData.get('featuredSortOrder'),
  })
}

export async function createCategoryAction(
  _state: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireAdmin()

  let imageFile: File | null

  try {
    imageFile = getCategoryImageFile(formData.get('imageFile'))
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : 'upload a valid category image.',
    )
  }

  const parsed = getFormValues(formData, imageFile ? '/pending-category-image-upload' : null)

  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? 'check the category details.',
    )
  }

  let uploadedImage: Awaited<ReturnType<typeof uploadCategoryImage>> | null = null

  if (imageFile) {
    try {
      uploadedImage = await uploadCategoryImage(imageFile, parsed.data.slug)
    } catch (error) {
      return actionError(
        error instanceof Error ? error.message : 'unable to upload category image.',
      )
    }
  }

  try {
    await createCategory({
      ...parsed.data,
      imageSrc: uploadedImage?.publicUrl ?? null,
    })
  } catch (error) {
    await deleteCategoryImage(uploadedImage?.path ?? null)
    return actionError(
      error instanceof Error ? error.message : 'unable to create category.',
    )
  }

  revalidateCategoryPaths()
  redirect('/admin/categories?message=category created successfully.')
}

export async function updateCategoryAction(
  categoryId: string,
  _state: CategoryActionResult,
  formData: FormData,
): Promise<CategoryActionResult> {
  await requireAdmin()

  const currentCategory = await getAdminCategoryById(categoryId)

  if (!currentCategory) {
    return actionError('category not found.')
  }

  let imageFile: File | null

  try {
    imageFile = getCategoryImageFile(formData.get('imageFile'))
  } catch (error) {
    return actionError(
      error instanceof Error ? error.message : 'upload a valid category image.',
    )
  }

  const parsed = getFormValues(
    formData,
    imageFile ? '/pending-category-image-upload' : currentCategory.image_src,
  )

  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? 'check the category details.',
    )
  }

  let uploadedImage: Awaited<ReturnType<typeof uploadCategoryImage>> | null = null

  if (imageFile) {
    try {
      uploadedImage = await uploadCategoryImage(imageFile, parsed.data.slug)
    } catch (error) {
      return actionError(
        error instanceof Error ? error.message : 'unable to upload category image.',
      )
    }
  }

  try {
    await updateCategory(categoryId, {
      ...parsed.data,
      imageSrc: uploadedImage?.publicUrl ?? currentCategory.image_src,
    })
  } catch (error) {
    await deleteCategoryImage(uploadedImage?.path ?? null)
    return actionError(
      error instanceof Error ? error.message : 'unable to update category.',
    )
  }

  if (uploadedImage && currentCategory.image_src) {
    await deleteCategoryImage(currentCategory.image_src)
  }

  revalidateCategoryPaths()
  redirect('/admin/categories?message=category updated successfully.')
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin()

  const categoryId = formData.get('categoryId')

  if (typeof categoryId !== 'string' || !categoryId) {
    redirect('/admin/categories?error=category not found.')
  }

  const category = await getAdminCategoryById(categoryId)

  if (!category) {
    redirect('/admin/categories?error=category not found.')
  }

  try {
    await deleteCategory(category)
    await deleteCategoryImage(category.image_src)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'unable to delete category.'

    redirect(`/admin/categories/${categoryId}?error=${encodeURIComponent(message)}`)
  }

  revalidateCategoryPaths()
  redirect('/admin/categories?message=category deleted successfully.')
}

export async function bulkDeleteCategoriesAction(categoryIds: string[]) {
  await requireAdmin()
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .in('id', categoryIds)

  if (error) {
    throw new Error(error.message || 'Failed to delete selected categories.')
  }

  revalidateCategoryPaths()
}
