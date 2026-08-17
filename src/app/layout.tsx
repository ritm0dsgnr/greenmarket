import type { Metadata } from 'next'
import '@fontsource/manrope/400.css'
import '@fontsource/montserrat/800.css'
import { IconSprite } from '@/components/IconSprite'
import { LayoutCartProvider } from '@/components/LayoutCartProvider'
import { SiteAmbience } from '@/components/SiteAmbience'
import { SiteCursor } from '@/components/SiteCursor'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
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
    <html lang="ru" id="top">
      <body>
        <LayoutCartProvider>
          <IconSprite />
          <SiteHeader />
          {children}
          <SiteFooter />
          <SiteAmbience />
          <SiteCursor />
        </LayoutCartProvider>
      </body>
    </html>
  )
}
