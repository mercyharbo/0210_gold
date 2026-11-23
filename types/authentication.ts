import type { components } from './api-schema'

type Schemas = components['schemas']
export type LoginPayload = Schemas['LoginBody']
export type SignupPayload = Schemas['SignupBody']
export type SignupResponse = Schemas['ActionData']
export type AuthSession = Schemas['SessionData']
export type AuthCsrf = Schemas['CsrfData']
export type GoogleAuthorization = Schemas['GoogleData']
export type LogoutResult = Schemas['LogoutData']

// Request/resend the code: { email }
export type RequestEmailVerificationPayload = Schemas['EmailBody']

// Confirm the code: { email, code }
export type VerifyEmailPayload = Schemas['VerificationBody']

// Response data for both
export type VerifyEmailResponse = Schemas['ActionData']

// Request reset code: { email }
export type PasswordResetRequestPayload = Schemas['EmailBody']

// Confirm reset: { email, code, password }
export type PasswordResetConfirmPayload = Schemas['ResetBody']

// Response data for both
export type PasswordResetResponse = Schemas['ActionData']
