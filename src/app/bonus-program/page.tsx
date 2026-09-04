import type { Metadata } from 'next'
import { BonusProgram } from '@/components/BonusProgram'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Бонусная программа | ${siteBrand}`,
  description: `Условия бонусной программы садового центра ${siteBrand}.`,
}

export default function BonusProgramPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { label: 'Бонусная программа' },
          ]}
        />
        <BonusProgram />
      </div>
    </main>
  )
}
