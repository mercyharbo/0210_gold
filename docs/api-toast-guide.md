# API feedback with shared toasts

Use the existing hook directly inside the component that owns the request:

```tsx
const { toast } = useToast()

try {
  const response = await request.execute('patch', '/account/profile', payload)
  toast(response.message || 'Profile updated successfully.', 'success')
} catch (error: unknown) {
  toast(error instanceof Error ? error.message : 'Unable to save. Try again.', 'failure')
}
```

`useToast` comes from `@/stores/hooks/use-toast`. Supported types are `success`,
`warning`, `failure` and `info`; older `error` callers map to `failure`.
Do not add toasts inside `useApiRequest` or server-data read hooks.

Keep API field errors beside their inputs and focus the first invalid field.
Only use fallback messages when the server did not supply usable feedback.
Important instructions and next-step links remain visible after a toast disappears.

The root layout mounts one Radix-backed `ToastProvider`. It displays up to three
notifications at the top center, queues additional messages, pauses the five-second
timeout during hover/focus, and animates entry/exit with reduced-motion support.
`QueryParamToast` forwards legacy redirect messages and readable Google callback
errors into this same provider; it does not render a second notification system.

Toasts remain across client-side route changes. Login's full-page redirect starts a
new document, so login does not create a success toast just before that redirect.
Profile saving resets the saved form and calls `await mutate()`; a refresh failure
is separate from a failed PATCH and must not repeat the write.
