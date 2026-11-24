export function NavLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex h-[1em] flex-col overflow-hidden leading-none">
      <span className="block shrink-0 transition-transform duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>

      <span
        aria-hidden="true"
        className="block shrink-0 transition-transform duration-[350ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
    </span>
  )
}
