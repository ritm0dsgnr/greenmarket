import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContentPage } from '@/components/content/ContentPage'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Прайс — ${siteBrand}`,
  description: `Актуальные цены на растения в каталоге садового центра ${siteBrand}.`,
}

export default function PricePage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Прайс' }]} />
        <ContentPage
          title="Прайс"
          lead="Цены на растения смотрите в каталоге сайта. Менеджер подтверждает стоимость и наличие перед заказом."
          highlight={{
            value: 'Каталог',
            text: 'Категории, фильтры и карточки товаров для визуальной приёмки вёрстки',
          }}
          sections={[
            {
              id: 'catalog',
              eyebrow: 'Онлайн',
              title: 'Где смотреть цены',
              paragraphs: [
                'На сайте показаны демонстрационные карточки для проверки интерфейса каталога. После подключения базы данных цены будут приходить с сервера и обновляться по регламенту импорта.',
                'Если нужен полный перечень позиций или оптовый расчёт, свяжитесь с менеджером — подберём растения и уточним актуальную стоимость.',
              ],
              links: [
                { href: '/catalog', label: 'Открыть каталог' },
                { href: '/contacts', label: 'Запросить расчёт' },
              ],
            },
            {
              id: 'updates',
              eyebrow: 'Обновления',
              title: 'Как меняются цены',
              cards: [
                {
                  title: 'Сезонность',
                  text: 'Стоимость и наличие зависят от сезона, размера контейнера и поставки. Менеджер сообщит актуальную цену перед подтверждением заказа.',
                },
                {
                  title: 'Подтверждение заказа',
                  text: 'Итоговая сумма фиксируется после согласования состава, доставки и способа оплаты.',
                },
                {
                  title: 'Бонусная программа',
                  text: `На растения действует бонусная программа ${siteBrand}. Условия начисления и списания описаны на отдельной странице.`,
                },
              ],
              links: [{ href: '/bonus-program', label: 'Бонусная программа' }],
            },
          ]}
        />
      </div>
    </main>
  )
}
