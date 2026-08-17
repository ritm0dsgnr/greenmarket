import Link from 'next/link'
import { Icon } from '@/components/Icon'

const tierItems = [
  {
    value: '5%',
    title: 'Стартовый уровень',
    text: 'Начисляем за подтверждённую сумму растений, пока накопленная сумма покупок не достигла 150 000 ₽.',
  },
  {
    value: '10%',
    title: 'Повышенный уровень',
    text: 'Начисляем, когда накопленная сумма покупок растений с даты регистрации достигает 150 000 ₽.',
  },
] as const

const terms = [
  {
    icon: 'leaf',
    title: 'Только растения',
    text: 'Бонусы начисляются и списываются только на сумму растений в покупке.',
  },
  {
    icon: 'check',
    title: 'До 50%',
    text: 'Бонусами можно оплатить до половины суммы растений в одной покупке.',
  },
  {
    icon: 'document',
    title: 'Сначала списание',
    text: 'Если списываете бонусы, новое начисление рассчитываем на сумму после списания.',
  },
  {
    icon: 'clock',
    title: 'Активация завтра',
    text: 'Бонусы за покупку становятся доступными в начале следующего календарного дня.',
  },
  {
    icon: 'document',
    title: 'Срок действия',
    text: 'Бонусы за покупку действуют один календарный год после активации.',
  },
  {
    icon: 'heart',
    title: 'День рождения',
    text: '500 бонусов начисляем за 7 дней до дня рождения. Использовать их можно 14 дней.',
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
          <p className="bonus-program__eyebrow">Green Market</p>
          <h1 className="bonus-program__title" id="bonus-program-title">
            Бонусная программа
          </h1>
          <p className="bonus-program__lead">
            Получайте бонусы за растения и оплачивайте ими до 50% следующей покупки растений.
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
        <p className="bonus-program__note">
          Если покупка приводит к сумме 150 000 ₽, на неё начисляется 10%. При
          списании бонусов новое начисление считаем после вычета списания и
          округляем вниз до целого бонуса.
        </p>
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
            <p>Назовите номер телефона кассиру при покупке.</p>
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
