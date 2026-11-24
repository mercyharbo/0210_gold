export const productImageAccept = 'image/jpeg,image/png,image/webp,image/avif'

export function validateProductImages(files: { size: number; type: string }[], count: number, replacing = false) {
  if (replacing && files.length !== 1) throw new Error('Choose one replacement image.')
  if (!replacing && count + files.length > 8) throw new Error('Use at most 8 product images.')
  if (files.some((file) => !productImageAccept.split(',').includes(file.type) || file.size <= 0 || file.size > 5 * 1024 * 1024))
    throw new Error('Choose JPEG, PNG, WebP or AVIF images up to 5 MB each.')
}
