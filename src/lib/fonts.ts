import { Inter, Raleway } from 'next/font/google'

export const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway'
})

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const systemFontStack = '-apple-system, BlinkMacSystemFont, "Apple Color Emoji", Inter, Roboto, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif'
