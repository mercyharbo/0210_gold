import { z } from 'zod'

// Validate before submitting; do not trim passwords or change their characters.
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(255, 'Use no more than 255 characters.'),
  email: z
    .email('Enter a valid email address.')
    .max(320, 'Email address is too long.'),
  password: z
    .string()
    .min(8, 'Use at least eight characters.')
    .max(128, 'Use no more than 128 characters.')
    .regex(/[A-Z]/, 'Include an uppercase letter.')
    .regex(/[a-z]/, 'Include a lowercase letter.')
    .regex(/[0-9]/, 'Include a number.')
    .regex(/[^A-Za-z0-9\s]/, 'Include a special character.'),
})

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(1024, 'Password is too long.'),
})

