import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const signupSchema = z.object({
  firstName: z.string().min(1, 'Enter your first name.'),
  lastName: z.string().min(1, 'Enter your last name.'),
  phone: z.string().optional(),
  email: z.email('Enter a valid email address.'),
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export function getFirstValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Check the form and try again.'
}
