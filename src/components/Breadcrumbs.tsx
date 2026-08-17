import { bindHangingWords } from '@/components/bindHangingWords'
import { Icon } from '@/components/Icon'

export type BreadcrumbItem = {
  href?: string
  label: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const current = index === items.length - 1

          return (
            <li className="breadcrumbs__item" key={`${item.label}-${index}`}>
              {index > 0 ? (
                <Icon name="chevron-down" className="breadcrumbs__sep" />
              ) : null}
              {current || !item.href ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {bindHangingWords(item.label)}
                </span>
              ) : (
                <a className="breadcrumbs__link" href={item.href}>
                  {bindHangingWords(item.label)}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
