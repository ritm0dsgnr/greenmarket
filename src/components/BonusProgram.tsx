import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { bindHangingWords } from '@/components/bindHangingWords'
import { siteBrand } from '@/components/siteContacts'

const t = bindHangingWords

const tierItems = [
  {
    value: '5%',
    title: 'Стартовый уровень',
    text: 'Начисляем за покупки растений, пока сумма не достигла 150 000 ₽.',
  },
  {
    value: '10%',
    title: 'Повышенный уровень',
    text: 'Начисляем, когда накопленная сумма покупок растений достигает 150 000 ₽.',
  },
] as const

const terms = [
  {
    icon: 'plant' as const,
    title: 'Только растения',
    text: 'Бонусы начисляются и списываются только за покупки растений на торговой площадке. Бонусы не начисляются за приобретение подарочных сертификатов.',
  },
  {
    icon: 'percent' as const,
    title: 'До 50%',
    text: 'Бонусами можно оплатить до половины суммы растений в одной покупке.',
  },
  {
    icon: 'receipt' as const,
    title: 'Сначала списание',
    text: 'Если списываете бонусы, новое начисление будет рассчитано на сумму после списания.',
  },
  {
    icon: 'timer' as const,
    title: 'Активация завтра',
    text: 'Бонусы за покупки становятся доступными в начале следующего календарного дня.',
  },
  {
    icon: 'calendar' as const,
    title: 'Срок действия',
    text: 'Бонусы за покупки действуют один календарный год.',
  },
  {
    icon: 'gift' as const,
    title: 'День рождения',
    text: '500 подарочных бонусов начисляем за 7 дней до дня рождения. Использовать их можно в течение 14 дней.',
  },
]

const partnerBenefits = [
  'Экономия времени на подбор посадочного материала',
  'Выбор и согласование растений по фото и видео',
  'Согласование сметы онлайн',
  'Особая система лояльности',
] as const

export function BonusProgram() {
  return (
    <section className="bonus-program" aria-labelledby="bonus-program-title">
      <header className="bonus-program__hero">
        <div className="bonus-program__intro">
          <p className="bonus-program__eyebrow">{siteBrand}</p>
          <h1 className="bonus-program__title" id="bonus-program-title">
            {t('Бонусная программа')}
          </h1>
          <p className="bonus-program__lead">
            {t('Получайте бонусы за покупку растений и оплачивайте ими до 50% следующих покупок.')}
          </p>
        </div>
        <div className="bonus-program__rate">
          <span className="bonus-program__rate-value">1 = 1 ₽</span>
          <span className="bonus-program__rate-text">{t('Один бонус равен одному рублю')}</span>
        </div>
      </header>

      <section className="bonus-program__section" aria-labelledby="bonus-levels-title">
        <div className="bonus-program__section-head">
          <p className="bonus-program__eyebrow">Начисление</p>
          <h2 className="bonus-program__section-title" id="bonus-levels-title">
            {t('Ваш уровень бонусов')}
          </h2>
        </div>
        <ol className="bonus-program__tiers">
          {tierItems.map((item) => (
            <li className="bonus-program__tier" key={item.value}>
              <span className="bonus-program__tier-value">{item.value}</span>
              <div className="bonus-program__tier-body">
                <h3 className="bonus-program__tier-title">{t(item.title)}</h3>
                <p className="bonus-program__tier-text">{t(item.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bonus-program__section" aria-labelledby="bonus-terms-title">
        <div className="bonus-program__section-head">
          <p className="bonus-program__eyebrow">Правила</p>
          <h2 className="bonus-program__section-title" id="bonus-terms-title">
            {t('Как работают бонусы')}
          </h2>
        </div>
        <ul className="bonus-program__terms">
          {terms.map((item) => (
            <li className="bonus-program__term" key={item.title}>
              <span className="info-mark">
                <Icon name={item.icon} />
              </span>
              <div className="bonus-program__term-body">
                <h3 className="bonus-program__term-title">{t(item.title)}</h3>
                <p className="bonus-program__term-text">{t(item.text)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bonus-program__join" aria-labelledby="bonus-join-title">
        <div className="bonus-program__join-head">
          <p className="bonus-program__eyebrow">Участие</p>
          <h2 className="bonus-program__section-title" id="bonus-join-title">
            {t('Как стать участником')}
          </h2>
        </div>
        <ol className="bonus-program__join-steps">
          <li>
            <span className="bonus-program__join-num" aria-hidden="true">
              1
            </span>
            <p>{t('Назовите ФИО и ваш номер телефона при покупке в Садовом центре.')}</p>
          </li>
          <li>
            <span className="bonus-program__join-num" aria-hidden="true">
              2
            </span>
            <p>{t('Для подарка ко дню рождения достаточно указать день и месяц.')}</p>
          </li>
        </ol>
      </section>

      <section className="bonus-program__partners" aria-labelledby="bonus-partners-title">
        <div className="bonus-program__partners-head">
          <p className="bonus-program__eyebrow">Партнёрам</p>
          <h2 className="bonus-program__partners-title" id="bonus-partners-title">
            {t('Выгодно сотрудничаем с ландшафтными дизайнерами и архитекторами')}
          </h2>
        </div>
        <ul className="bonus-program__partners-list">
          {partnerBenefits.map((benefit) => (
            <li className="bonus-program__partners-item" key={benefit}>
              <span className="info-mark info-mark--sm">
                <Icon name="check" />
              </span>
              <span>{t(benefit)}</span>
            </li>
          ))}
        </ul>
        <div className="bonus-program__partners-contact">
          <p>{t('Для уточнения условий сотрудничества свяжитесь с менеджером.')}</p>
          <Link className="bonus-program__partners-link" href="/contacts">
            {t('Связаться с менеджером')}
            <Icon name="arrow-right" className="bonus-program__partners-link-icon" />
          </Link>
        </div>
      </section>
    </section>
  )
}
