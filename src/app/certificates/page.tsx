import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ContentPage } from '@/components/content/ContentPage'
import { siteBrand } from '@/components/siteContacts'

export const metadata: Metadata = {
  title: `Сертификаты — ${siteBrand}`,
  description: `Документы качества и сопровождение посадочного материала ${siteBrand}.`,
}

export default function CertificatesPage() {
  return (
    <main className="page">
      <div className="container">
        <Breadcrumbs items={[{ href: '/', label: 'Главная' }, { label: 'Сертификаты' }]} />
        <ContentPage
          title="Сертификаты"
          lead="Работаем с проверенными поставщиками и сопровождаем посадочный материал документами, когда это требуется для заказа."
          sections={[
            {
              id: 'quality',
              eyebrow: 'Качество',
              title: 'Что подтверждаем',
              cards: [
                {
                  title: 'Происхождение материала',
                  text: 'Для поставок, где это предусмотрено, предоставляем сопроводительные документы и информацию о происхождении растений.',
                },
                {
                  title: 'Соответствие сорту',
                  text: 'При отгрузке уточняем сорт, контейнер, возраст и размер, чтобы вы получили именно то, что согласовали с менеджером.',
                },
                {
                  title: 'Сезонные рекомендации',
                  text: 'Подсказываем сроки посадки и условия хранения до высадки, чтобы растения лучше прижились.',
                },
              ],
            },
            {
              id: 'request',
              eyebrow: 'Запрос',
              title: 'Как получить копии документов',
              paragraphs: [
                'Если для вашего заказа нужны копии сертификатов или сопроводительных документов, сообщите об этом менеджеру при оформлении заявки.',
                'Мы подготовим комплект до отгрузки или передадим его вместе с заказом при самовывозе.',
              ],
              links: [{ href: '/contacts', label: 'Связаться с садовым центром' }],
            },
          ]}
        />
      </div>
    </main>
  )
}
