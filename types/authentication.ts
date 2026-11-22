import type { components } from './api-schema'

type Schemas = components['schemas']
export type LoginPayload = Schemas['LoginBody']
export type AuthSession = Schemas['SessionData']
export type AuthCsrf = Schemas['CsrfData']
export type GoogleAuthorization = Schemas['GoogleData']
export type LogoutResult = Schemas['LogoutData']
