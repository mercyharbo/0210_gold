import localFont from 'next/font/local'

export const generalSans = localFont({
  src: [
    { path: '../../app/fonts/GeneralSans-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../app/fonts/GeneralSans-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../app/fonts/GeneralSans-Semibold.woff2', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
})
