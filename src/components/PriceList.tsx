'use client'

import { useId, useState, type FormEvent } from 'react'
import { bindHangingWords } from '@/components/bindHangingWords'
import { siteBrand } from '@/components/siteContacts'

const t = bindHangingWords

export function PriceList() {
  const emailId = useId()
  const [done, setDone] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Visual fixture only: values are not read, sent, stored, or logged.
    setDone(true)
  }

  return (
    <section className="price-list" aria-labelledby="price-list-title">
      <header className="price-list__hero">
        <p className="price-list__eyebrow">{siteBrand}</p>
        <h1 className="price-list__title" id="price-list-title">
          {t('Прайс')}
        </h1>
        <p className="price-list__lead">
          {t('По запросу мы можем вам отправить наш актуальный прайс-лист.')}
        </p>
      </header>

      <section className="price-list__request" aria-label="Запрос прайса">
        {done ? (
          <div className="price-list__done">
            <p className="price-list__done-title">Демонстрация</p>
            <p className="price-list__done-note">
              Заявка не создана. Данные формы не отправляются и не сохраняются.
            </p>
            <button className="price-list__submit" type="button" onClick={() => setDone(false)}>
              Закрыть
            </button>
          </div>
        ) : (
          <form className="price-list__form" noValidate onSubmit={onSubmit}>
            <label className="price-list__field" htmlFor={emailId}>
              <span className="price-list__label">Электронная почта</span>
              <input
                className="price-list__input"
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@example.com"
              />
            </label>
            <button className="price-list__submit" type="submit">
              Отправить прайс
            </button>
          </form>
        )}
      </section>
    </section>
  )
}
