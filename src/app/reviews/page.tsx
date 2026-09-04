import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContentPage } from '@/components/content/ContentPage'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Отзывы — ${siteBrand}`,
  description: `Отзывы покупателей садового центра ${siteBrand}.`,
}

const reviewFixtures = [
  {
    title: '«Помогли подобрать растения под участок»',
    text: 'Обратились за декоративными кустарниками и многолетниками. Менеджер уточнил освещение и почву, предложил несколько вариантов и объяснил уход после посадки.',
  },
  {
    title: '«Удобно забрать заказ в центре»',
    text: 'Самовывоз прошёл быстро: растения были подготовлены, контейнеры аккуратно упакованы. На месте показали, как правильно пересаживать.',
  },
  {
    title: '«Большой выбор и понятные консультации»',
    text: 'Искали хвойные и пряные травы для нового проекта. Получили понятные рекомендации по сочетанию растений и сезону посадки.',
  },
] as const

export default function ReviewsPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Отзывы' }]} />
        <ContentPage
          title="Отзывы"
          lead="Примеры отзывов показаны для приёмки вёрстки. После запуска раздел будет наполняться подтверждёнными отзывами покупателей."
          sections={[
            {
              id: 'reviews',
              eyebrow: 'Покупатели',
              title: 'Что говорят о нас',
              cards: [...reviewFixtures],
            },
            {
              id: 'share',
              eyebrow: 'Ваш опыт',
              title: 'Поделиться впечатлением',
              paragraphs: [
                `Если вы уже покупали растения в ${siteBrand}, расскажите менеджеру о своём опыте — мы сохраним отзыв после модерации.`,
                'Публикация отзывов на сайте появится вместе с подключением контентного контура.',
              ],
              links: [{ href: '/contacts', label: 'Связаться с нами' }],
            },
          ]}
          fixtureNote
        />
      </div>
    </main>
  )
}
