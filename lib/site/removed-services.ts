/** Retired routes bypass authentication redirects and resolve to the normal 404. */
export function isRemovedServiceRoute(pathname: string) {
  return ['/admin/requests', '/admin/personal-shopper-requests'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}
