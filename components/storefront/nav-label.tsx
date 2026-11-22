export function NavLabel({ children }: { children: string }) {
  return (
    <span className="meere-rolling-label">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  )
}
