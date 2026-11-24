import type { ReactNode } from 'react'

export function Marquee({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role='group'
      tabIndex={0}
      aria-label={`${label}. Hover or focus to pause scrolling.`}
      className='group/marquee h-full overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white'
    >
      <div
        aria-hidden='true'
        className='flex h-full w-max animate-storefront-marquee! [animation-duration:30s]!
          motion-reduce:[animation-duration:90s]!
          group-hover/marquee:[animation-play-state:paused]!
          group-focus-within/marquee:[animation-play-state:paused]!'
      >
        {[0, 1].map((group) => (
          <div key={group} className='flex shrink-0 items-center'>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
