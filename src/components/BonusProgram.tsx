import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { siteBrand } from '@/components/siteContacts'

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
    icon: 'leaf',
    title: 'Только растения',
    text: 'Бонусы начисляются и списываются только за покупки растений на торговой площадке. Бонусы не начисляются за приобретение подарочных сертификатов.',
  },
  {
    icon: 'check',
    title: 'До 50%',
    text: 'Бонусами можно оплатить до половины суммы растений в одной покупке.',
  },
  {
    icon: 'document',
    title: 'Сначала списание',
    text: 'Если списываете бонусы, новое начисление будет рассчитано на сумму после списания.',
  },
  {
    icon: 'clock',
    title: 'Активация завтра',
    text: 'Бонусы за покупки становятся доступными в начале следующего календарного дня.',
  },
  {
    icon: 'document',
    title: 'Срок действия',
    text: 'Бонусы за покупки действуют один календарный год.',
  },
  {
    icon: 'heart',
    title: 'День рождения',
    text: '500 подарочных бонусов начисляем за 7 дней до дня рождения. Использовать их можно в течение 14 дней.',
  },
] as const

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
            Бонусная программа
          </h1>
          <p className="bonus-program__lead">
            Получайте бонусы за покупку растений и оплачивайте ими до 50% следующих покупок.
          </p>
        </div>
        <div className="bonus-program__rate">
          <span className="bonus-program__rate-value">1 = 1 ₽</span>
          <span className="bonus-program__rate-text">Один бонус равен одному рублю</span>
        </div>
      </header>

      <section className="bonus-program__section" aria-labelledby="bonus-levels-title">
        <div className="bonus-program__section-head">
          <p className="bonus-program__eyebrow">Начисление</p>
          <h2 className="bonus-program__section-title" id="bonus-levels-title">
            Ваш уровень бонусов
          </h2>
        </div>
        <ol className="bonus-program__tiers">
          {tierItems.map((item) => (
            <li className="bonus-program__tier" key={item.value}>
              <span className="bonus-program__tier-value">{item.value}</span>
              <div className="bonus-program__tier-content">
                <h3 className="bonus-program__tier-title">{item.title}</h3>
                <p className="bonus-program__tier-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bonus-program__section" aria-labelledby="bonus-terms-title">
        <div className="bonus-program__section-head">
          <p className="bonus-program__eyebrow">Правила</p>
          <h2 className="bonus-program__section-title" id="bonus-terms-title">
            Как работают бонусы
          </h2>
        </div>
        <ul className="bonus-program__terms">
          {terms.map((item) => (
            <li className="bonus-program__term" key={item.title}>
              <Icon name={item.icon} className="bonus-program__term-icon" />
              <div>
                <h3 className="bonus-program__term-title">{item.title}</h3>
                <p className="bonus-program__term-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bonus-program__section bonus-program__section--join" aria-labelledby="bonus-join-title">
        <div className="bonus-program__join">
          <div>
            <p className="bonus-program__eyebrow">Участие</p>
            <h2 className="bonus-program__section-title" id="bonus-join-title">
              Как стать участником
            </h2>
          </div>
          <div className="bonus-program__join-copy">
            <p>Назовите ФИО и ваш номер телефона при покупке в Садовом центре.</p>
            <p>Для подарка ко дню рождения достаточно указать день и месяц.</p>
          </div>
        </div>
      </section>

      <section className="bonus-program__partners" aria-labelledby="bonus-partners-title">
        <div className="bonus-program__partners-head">
          <p className="bonus-program__eyebrow">Партнёрам</p>
          <h2 className="bonus-program__section-title" id="bonus-partners-title">
            Выгодно сотрудничаем с ландшафтными дизайнерами и архитекторами
          </h2>
        </div>
        <div className="bonus-program__partners-content">
          <ul className="bonus-program__partners-list">
            {partnerBenefits.map((benefit) => (
              <li className="bonus-program__partners-item" key={benefit}>
                <Icon name="check" className="bonus-program__partners-icon" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="bonus-program__partners-contact">
            <p>Для уточнения условий сотрудничества свяжитесь с менеджером.</p>
            <Link className="bonus-program__partners-link" href="/contacts">
              Связаться с менеджером
              <Icon name="arrow-right" className="bonus-program__partners-link-icon" />
            </Link>
          </div>
        </div>
      </section>
    </section>
  )
}
