import type { Metadata } from 'next'
import { BonusProgram } from '@/components/BonusProgram'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Бонусная программа | Green Market',
  description: 'Условия бонусной программы садового центра Green Market.',
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
