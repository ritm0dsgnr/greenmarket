export const journalKinds = ['events', 'news', 'articles'] as const

export type JournalKind = (typeof journalKinds)[number]

export const journalKindLabels: Record<JournalKind, string> = {
  events: 'мероприятия',
  news: 'новости',
  articles: 'статьи',
}

/** Long event copy for the signup popup (CMS/admin field set). */
export type JournalSignupDetails = {
  lead: string
  points?: readonly string[]
  place?: string
  callToAction?: string
}

export type JournalItem = {
  id: string
  kind: JournalKind
  /** Machine date (YYYY-MM-DD); shared by card, popup, and sorting. */
  date: string
  title: string
  /** Short bullets for the card (admin). */
  highlights?: readonly string[]
  excerpt?: string
  /**
   * Human date/time label for card + popup tags (admin).
   * Same value on the card and in the signup popup.
   */
  timeLabel?: string
  /** Price tag for card + popup (admin). */
  priceLabel?: string
  address?: string
  imageSrc?: string
  imageAlt?: string
  href?: string
  /** Long description shown in the «Записаться» popup (admin). */
  signup?: JournalSignupDetails
  /** Fixture stand-in for CMS/admin «показывать в слайдере на главной». */
  inHomeSlider?: boolean
  /** Explicit admin order among home slider picks; lower first. */
  homeSliderOrder?: number
}

export function isJournalKind(value: string): value is JournalKind {
  return (journalKinds as readonly string[]).includes(value)
}

/** Exclusive filter: first valid type wins (OR, not multi-select). */
export function parseJournalTypeQuery(raw: string | string[] | undefined): JournalKind[] {
  const chunks = Array.isArray(raw) ? raw : raw ? [raw] : []

  for (const chunk of chunks) {
    for (const part of chunk.split(',')) {
      const normalized = part.trim().toLowerCase()

      if (isJournalKind(normalized)) {
        return [normalized]
      }
    }
  }

  return []
}

export function withJournalTypeQuery(path: string, kinds: readonly JournalKind[]) {
  const kind = kinds[0]

  if (!kind) {
    return path
  }

  return `${path}?type=${encodeURIComponent(kind)}`
}

function kindRank(kind: JournalKind) {
  return journalKinds.indexOf(kind)
}

function compareJournalHomeSlider(left: JournalItem, right: JournalItem) {
  const orderLeft = left.homeSliderOrder
  const orderRight = right.homeSliderOrder

  if (orderLeft != null && orderRight != null && orderLeft !== orderRight) {
    return orderLeft - orderRight
  }

  if (orderLeft != null && orderRight == null) {
    return -1
  }

  if (orderLeft == null && orderRight != null) {
    return 1
  }

  const kindDiff = kindRank(left.kind) - kindRank(right.kind)

  if (kindDiff !== 0) {
    return kindDiff
  }

  return right.date.localeCompare(left.date)
}

/**
 * Home slider picks: marked `inHomeSlider` from admin/CMS when present.
 * Fallback without marks: events, then news, then articles (by date within kind).
 */
export function getHomeJournalSliderItems(
  items: readonly JournalItem[],
  limit = 8,
): JournalItem[] {
  const marked = items.filter((item) => item.inHomeSlider)
  const source =
    marked.length > 0
      ? marked
      : [...items].sort((left, right) => {
          const kindDiff = kindRank(left.kind) - kindRank(right.kind)
          if (kindDiff !== 0) {
            return kindDiff
          }
          return right.date.localeCompare(left.date)
        })

  return [...source].sort(compareJournalHomeSlider).slice(0, Math.max(0, limit))
}

export const journalItems: readonly JournalItem[] = [
  {
    id: 'event-botanical-relief',
    kind: 'events',
    date: '2026-08-03',
    title: 'Мастер-класс: ботанический барельеф',
    highlights: [
      'Живые растения, глина и гипс',
      'Композиция для участка',
      'Панно с портретом цветов',
    ],
    timeLabel: '3 августа, 12:00',
    priceLabel: '2500₽',
    address: 'Берёзовский, ул. Рассветная, 1А',
    signup: {
      lead: 'Приглашаем вас на мастер-класс по созданию ботанического барельефа, который пройдёт 3 августа в 12:00 в садовом центре Грин Маркет.',
      points: [
        'Создание своего барельефа: живые растения, глина и гипс. Неповторимое панно с портретом живых цветов.',
        'Эксперты садового центра Грин Маркет расскажут, как составить композицию из древесно-кустарниковой группы и многолетников для гармоничного образа участка.',
      ],
      place: 'Садовый центр Грин Маркет: Берёзовский, ул. Рассветная, 1А',
      callToAction: 'Записывайтесь на мастер-класс прямо сейчас.\nКоличество мест ограничено.',
    },
    inHomeSlider: true,
    homeSliderOrder: 1,
  },
  {
    id: 'event-wreath-workshop',
    kind: 'events',
    date: '2026-05-13',
    title: 'Мастер-класс по изготовлению новогодних венков и композиций',
    highlights: ['Теория и практика', 'Обзор инструмента', 'Этапы создания'],
    timeLabel: '13 мая, 12:00',
    priceLabel: '3500₽',
    address: 'ул. Рассветная, 1А',
    inHomeSlider: true,
    homeSliderOrder: 2,
  },
  {
    id: 'event-open-day',
    kind: 'events',
    date: '2026-06-08',
    title: 'День открытых дверей в садовом центре',
    highlights: ['Экскурсия по питомнику', 'Консультации по посадке', 'Подбор растений для участка'],
    timeLabel: '8 июня, 11:00',
    priceLabel: 'бесплатно',
    address: 'ул. Рассветная, 1А',
    inHomeSlider: true,
    homeSliderOrder: 3,
  },
  {
    id: 'event-rose-weekend',
    kind: 'events',
    date: '2026-07-20',
    title: 'Розовый weekend: подбор сортов и уход',
    highlights: ['Обзор коллекции роз', 'Обрезка и подкормка', 'Подготовка к зимовке'],
    timeLabel: '20 июля, 12:00',
    priceLabel: '1500₽',
    address: 'ул. Рассветная, 1А',
  },
  {
    id: 'event-hydrangea-day',
    kind: 'events',
    date: '2026-08-02',
    title: 'День гортензий: сорта, посадка и полив',
    highlights: ['Разбор сортов', 'Правила посадки', 'Сезонный уход'],
    timeLabel: '2 августа, 12:00',
    priceLabel: '1200₽',
    address: 'ул. Рассветная, 1А',
    inHomeSlider: true,
    homeSliderOrder: 4,
  },
  {
    id: 'event-kids-garden',
    kind: 'events',
    date: '2026-08-16',
    title: 'Детский мастер-класс «Моя первая клумба»',
    highlights: ['Знакомство с растениями', 'Посадка в контейнер', 'Простой уход'],
    timeLabel: '16 августа, 12:00',
    priceLabel: '800₽',
    address: 'ул. Рассветная, 1А',
  },
  {
    id: 'event-autumn-prune',
    kind: 'events',
    date: '2026-09-12',
    title: 'Осенняя обрезка кустарников и подготовка к зиме',
    highlights: ['Инструменты и техника', 'Сроки обрезки', 'Укрытие теплолюбивых'],
    timeLabel: '12 сентября, 12:00',
    priceLabel: '2000₽',
    address: 'ул. Рассветная, 1А',
  },
  {
    id: 'news-season',
    kind: 'news',
    date: '2026-03-01',
    title: 'Открыли весенний сезон в садовом центре',
    excerpt:
      'Обновили витрину многолетников и декоративных кустарников, принимаем заказы на посадочный материал.',
    inHomeSlider: true,
    homeSliderOrder: 5,
  },
  {
    id: 'news-bonus',
    kind: 'news',
    date: '2026-02-10',
    title: 'Бонусная программа Грин Маркет',
    excerpt:
      'Начисляем бонусы за покупку растений и подробно описали условия на отдельной странице сайта.',
    inHomeSlider: true,
    homeSliderOrder: 6,
  },
  {
    id: 'news-hours',
    kind: 'news',
    date: '2026-01-05',
    title: 'Режим работы в праздничные дни',
    excerpt: 'Садовый центр работает с 9:00 до 18:00 ежедневно. Перед визитом можно уточнить наличие по телефону.',
  },
  {
    id: 'article-soil',
    kind: 'articles',
    date: '2026-04-02',
    title: 'Как подготовить почву под декоративные кустарники',
    excerpt: 'Разбираем дренаж, структуру грунта и базовую подкормку перед высадкой весной.',
    inHomeSlider: true,
    homeSliderOrder: 6,
  },
  {
    id: 'article-water',
    kind: 'articles',
    date: '2026-03-18',
    title: 'Полив в жару: частые ошибки и простые правила',
    excerpt:
      'Почему растения страдают от редкого глубокого полива и как сохранить влагу без переливов.',
    inHomeSlider: true,
    homeSliderOrder: 7,
  },
  {
    id: 'article-conifers',
    kind: 'articles',
    date: '2026-02-25',
    title: 'Хвойные в маленьком саду: компактные формы и сочетания',
    excerpt: 'Подборка низкорослых хвойных для клумбы, рокария и посадки у террасы.',
  },
  {
    id: 'article-roses',
    kind: 'articles',
    date: '2026-02-10',
    title: 'Розы для Урала: зимостойкие сорта и укрытие',
    excerpt: 'Какие группы роз лучше переносят зиму и как подготовить куст к морозам.',
  },
  {
    id: 'article-hydrangea',
    kind: 'articles',
    date: '2026-01-28',
    title: 'Гортензии: кислотность почвы и цвет соцветий',
    excerpt:
      'Как влияет pH на окраску и что учесть при посадке метельчатых и крупнолистных сортов.',
  },
  {
    id: 'article-lawn',
    kind: 'articles',
    date: '2026-01-14',
    title: 'Газон после зимы: ремонт проплешин и первый покос',
    excerpt: 'Пошаговый план весеннего ухода: аэрация, подсев и график стрижки.',
  },
  {
    id: 'article-fruit',
    kind: 'articles',
    date: '2025-12-20',
    title: 'Плодовые для небольшого участка: колонны и карлики',
    excerpt: 'Как разместить яблони, груши и ягодники без затенения всего сада.',
  },
  {
    id: 'article-pests',
    kind: 'articles',
    date: '2025-12-05',
    title: 'Тля и мучнистая роса: профилактика без лишней химии',
    excerpt: 'Ранние признаки, безопасные меры и когда уже нужна обработка.',
  },
  {
    id: 'article-containers',
    kind: 'articles',
    date: '2025-11-18',
    title: 'Контейнерный сад на террасе: грунт, дренаж и зимовка',
    excerpt: 'Что выбрать для кашпо, как поливать летом и куда убирать растения на зиму.',
  },
]

export function getJournalItemById(id: string) {
  return journalItems.find((item) => item.id === id) ?? null
}

/** Shared card + popup tags from admin fields (title stays on the item). */
export function getJournalEventTags(item: JournalItem) {
  return {
    timeLabel: item.timeLabel ?? null,
    priceLabel: item.priceLabel ?? null,
  }
}
