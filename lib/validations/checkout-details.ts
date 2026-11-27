import { z } from 'zod'

// Local form validation only. FastAPI will validate the final checkout payload later.
export const checkoutDetailsSchema = z.object({
  recipient_name: z.string().trim().min(2, 'Enter the recipient’s full name.').max(200),
  email: z.email('Enter a valid email address.'),
  phone: z.string().regex(/^\+?[0-9 ()-]{7,30}$/, 'Enter a valid phone number.'),
  address_line_1: z.string().trim().min(5, 'Enter your delivery address.').max(1000),
  state: z.string().min(1, 'Choose your state or FCT.'),
  local_area: z.string().min(1, 'Choose your local government area.'),
  locality: z.string().max(150),
})

export type CheckoutDetails = z.infer<typeof checkoutDetailsSchema>
