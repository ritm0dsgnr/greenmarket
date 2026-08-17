import Link from 'next/link'

export function SiteNotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <h1 className="not-found__title" id="not-found-title">
        Страница не найдена
      </h1>
      <p className="not-found__lead">
        Такой страницы нет. Проверьте адрес или выберите раздел в каталоге.
      </p>
      <div className="not-found__actions">
        <Link className="not-found__action" href="/">
          На главную
        </Link>
        <Link className="not-found__action not-found__action--line" href="/catalog">
          В каталог
        </Link>
      </div>
    </section>
  )
}
