const cookieNames = new Set(['fmluxe_session', 'fmluxe_csrf', 'fmluxe_oauth'])

export function backendCookieHeader(header: string | null) {
  return (header ?? '').split(';').map((part) => part.trim())
    .filter((part) => cookieNames.has(part.split('=', 1)[0])).join('; ')
}

export function hasBackendSession(header: string | null) {
  return backendCookieHeader(header).split('; ').some((part) => /^fmluxe_session=.+$/.test(part))
}
