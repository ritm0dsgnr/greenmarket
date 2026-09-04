import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContentPage } from '@/components/content/ContentPage'
import {
  siteAddressShort,
  siteGardenName,
  siteHours,
  sitePhoneDisplay,
  sitePhoneHref,
  siteBrand,
} from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Доставка — ${siteBrand}`,
  description: `Самовывоз и доставка растений из садового центра ${siteBrand} в Березовском.`,
}

export default function DeliveryPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Доставка' }]} />
        <ContentPage
          title="Доставка"
          lead="Заберите заказ в садовом центре или согласуйте доставку с менеджером после оформления заявки."
          highlight={{
            value: siteHours,
            text: 'Самовывоз и консультация на месте ежедневно',
          }}
          sections={[
            {
              id: 'pickup',
              eyebrow: 'Самовывоз',
              title: 'Забрать в садовом центре',
              paragraphs: [
                `${siteGardenName} находится по адресу ${siteAddressShort}. На месте можно посмотреть ассортимент, уточнить посадочный материал и получить рекомендации по уходу.`,
                'Перед визитом позвоните или напишите менеджеру, чтобы подтвердить наличие и подготовить заказ.',
              ],
              links: [
                { href: sitePhoneHref, label: `Позвонить ${sitePhoneDisplay}` },
                { href: '/contacts', label: 'Контакты и карта' },
              ],
            },
            {
              id: 'delivery',
              eyebrow: 'Доставка',
              title: 'Доставка по городу и области',
              cards: [
                {
                  title: 'Расчёт стоимости',
                  text: 'Стоимость доставки зависит от адреса, объёма и состава заказа. Менеджер рассчитает сумму после подтверждения заявки.',
                },
                {
                  title: 'Согласование времени',
                  text: 'Дату и интервал доставки согласовываем по телефону или в мессенджере после оформления заказа.',
                },
                {
                  title: 'Аккуратная перевозка',
                  text: 'Растения упаковываем с учётом контейнера, сезона и дороги, чтобы посадочный материал доехал в хорошем виде.',
                },
              ],
            },
          ]}
        />
        <p className="content-page__inline-note">
          Оформление заявки на сайте пока демонстрирует интерфейс. Заказ не создаётся автоматически.
          Для покупки позвоните по телефону{' '}
          <Link href={sitePhoneHref}>{sitePhoneDisplay}</Link>.
        </p>
      </div>
    </main>
  )
}
