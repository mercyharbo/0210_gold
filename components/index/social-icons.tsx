import type { SVGProps } from 'react'

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' aria-hidden='true' {...props}>
      <rect
        width='16'
        height='16'
        x='4'
        y='4'
        rx='4.5'
        stroke='currentColor'
        strokeWidth='1.8'
      />
      <circle cx='12' cy='12' r='3.5' stroke='currentColor' strokeWidth='1.8' />
      <circle cx='17' cy='7' r='1.1' fill='currentColor' />
    </svg>
  )
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' {...props}>
      <path d='M14.2 8.4V6.9c0-.7.5-.9.9-.9h2.3V2.2L14.2 2c-3.6 0-4.5 2.7-4.5 4.5v1.9H7v4h2.7V22h4.4v-9.6h3l.5-4h-3.4Z' />
    </svg>
  )
}

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' {...props}>
      <path d='M16.7 2c.3 2.5 1.7 4 4.1 4.2v3.6a7.6 7.6 0 0 1-4-1.2v6.5c0 4.1-2.8 6.9-6.8 6.9-3.6 0-6.8-2.6-6.8-6.4 0-4.3 4.1-7.2 8.2-6.3v3.8c-1.9-.6-4.2.6-4.2 2.6 0 1.5 1.2 2.6 2.8 2.6 1.8 0 2.9-1 2.9-3.2V2h3.8Z' />
    </svg>
  )
}

export const socialLinks = [
  { href: '#', label: 'Instagram', Icon: InstagramIcon },
  { href: '#', label: 'Facebook', Icon: FacebookIcon },
  { href: '#', label: 'TikTok', Icon: TiktokIcon },
]
