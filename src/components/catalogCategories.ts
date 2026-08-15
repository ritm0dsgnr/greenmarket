export type CatalogSubcategory = {
  slug: string
  label: string
}

export type CatalogCategory = {
  slug: string
  href: string
  label: string
  subcategories: readonly CatalogSubcategory[]
}

type CatalogGroup = {
  title: string
  items: readonly CatalogCategory[]
}

export const catalogGroups: readonly CatalogGroup[] = [
  {
    title: 'Растения',
    items: [
      {
        slug: 'plodovye',
        href: '/catalog/plodovye',
        label: 'Плодовые',
        subcategories: [
          { slug: 'yabloni', label: 'Яблони' },
          { slug: 'grushi', label: 'Груши' },
          { slug: 'slivy', label: 'Сливы' },
          { slug: 'vishni', label: 'Вишни' },
        ],
      },
      {
        slug: 'vereskovye',
        href: '/catalog/vereskovye',
        label: 'Рододендроны, азалии, вересковые',
        subcategories: [
          { slug: 'rododendrony', label: 'Рододендроны' },
          { slug: 'azalii', label: 'Азалии' },
          { slug: 'vereski', label: 'Верески' },
          { slug: 'eriki', label: 'Эрики' },
        ],
      },
      {
        slug: 'derevya',
        href: '/catalog/derevya',
        label: 'Аллейно-парковые и другие деревья',
        subcategories: [
          { slug: 'lipy', label: 'Липы' },
          { slug: 'kleny', label: 'Клёны' },
          { slug: 'duby', label: 'Дубы' },
          { slug: 'berezy', label: 'Берёзы' },
        ],
      },
      {
        slug: 'kustarniki',
        href: '/catalog/kustarniki',
        label: 'Декоративные кустарники',
        subcategories: [
          { slug: 'gortenii', label: 'Гортензии' },
          { slug: 'spirei', label: 'Спиреи' },
          { slug: 'siren', label: 'Сирень' },
          { slug: 'barbaris', label: 'Барбарис' },
        ],
      },
      {
        slug: 'pryanye',
        href: '/catalog/pryanye',
        label: 'Пряные и лекарственные травы',
        subcategories: [
          { slug: 'myata', label: 'Мята' },
          { slug: 'bazilik', label: 'Базилик' },
          { slug: 'rozmarin', label: 'Розмарин' },
          { slug: 'lavanda', label: 'Лаванда' },
        ],
      },
      {
        slug: 'mnogoletniki',
        href: '/catalog/mnogoletniki',
        label: 'Травянистые многолетние',
        subcategories: [
          { slug: 'hosty', label: 'Хосты' },
          { slug: 'piony', label: 'Пионы' },
          { slug: 'astilby', label: 'Астильбы' },
          { slug: 'floksy', label: 'Флоксы' },
        ],
      },
      {
        slug: 'zlaki',
        href: '/catalog/zlaki',
        label: 'Декоративные злаки и травы',
        subcategories: [
          { slug: 'miskantus', label: 'Мискантус' },
          { slug: 'ovsyanica', label: 'Овсяница' },
          { slug: 'kovyl', label: 'Ковыль' },
          { slug: 'veynik', label: 'Вейник' },
        ],
      },
      {
        slug: 'lukovichnye',
        href: '/catalog/lukovichnye',
        label: 'Луковичные',
        subcategories: [
          { slug: 'tyulpany', label: 'Тюльпаны' },
          { slug: 'narcissy', label: 'Нарциссы' },
          { slug: 'giacinty', label: 'Гиацинты' },
          { slug: 'lilii', label: 'Лилии' },
        ],
      },
      {
        slug: 'liany',
        href: '/catalog/liany',
        label: 'Лианы',
        subcategories: [
          { slug: 'klematisy', label: 'Клематисы' },
          { slug: 'vinograd', label: 'Виноград' },
          { slug: 'plyushch', label: 'Плющ' },
          { slug: 'zhimolost', label: 'Жимолость' },
        ],
      },
    ],
  },
  {
    title: 'Сопутствующие товары',
    items: [
      {
        slug: 'dekor',
        href: '/catalog/dekor',
        label: 'Садовый декор',
        subcategories: [
          { slug: 'kashpo', label: 'Кашпо' },
          { slug: 'figury', label: 'Садовые фигуры' },
          { slug: 'opory', label: 'Опоры' },
          { slug: 'fonari', label: 'Фонари' },
        ],
      },
      {
        slug: 'odezhda',
        href: '/catalog/odezhda',
        label: 'Садовая одежда',
        subcategories: [
          { slug: 'perchatki', label: 'Перчатки' },
          { slug: 'fartuki', label: 'Фартуки' },
          { slug: 'sapogi', label: 'Сапоги' },
          { slug: 'shapki', label: 'Головные уборы' },
        ],
      },
      {
        slug: 'soputstvuyushchie',
        href: '/catalog/soputstvuyushchie',
        label: 'Сопутствующие товары',
        subcategories: [
          { slug: 'grunty', label: 'Грунты' },
          { slug: 'udobreniya', label: 'Удобрения' },
          { slug: 'zashchita', label: 'Средства защиты' },
          { slug: 'instrumenty', label: 'Инструменты' },
        ],
      },
      {
        slug: 'mebel',
        href: '/catalog/mebel',
        label: 'Садовая мебель',
        subcategories: [
          { slug: 'stoly', label: 'Столы' },
          { slug: 'stulya', label: 'Стулья' },
          { slug: 'skameyki', label: 'Скамейки' },
          { slug: 'shezlongi', label: 'Шезлонги' },
        ],
      },
    ],
  },
] as const

export const catalogCategories: readonly CatalogCategory[] = catalogGroups.flatMap((group) => group.items)

export const homeCatalogCategories = catalogCategories.slice(0, 5)

export function getCategoryBySlug(slug: string) {
  return catalogCategories.find((category) => category.slug === slug)
}

export function getSubcategory(categorySlug: string, subcategorySlug: string) {
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    return null
  }

  const subcategory = category.subcategories.find((item) => item.slug === subcategorySlug)

  if (!subcategory) {
    return null
  }

  return { category, subcategory }
}
