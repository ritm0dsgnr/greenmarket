import type { Metadata } from 'next'
import '@fontsource/manrope/400.css'
import '@fontsource/montserrat/800.css'
import '../sass/style.sass'

export const metadata: Metadata = {
  title: 'Green Market',
  description: 'Green Market, садовый центр.',
  verification: {
    yandex: 'c06ed7d38e162ebf',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
