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

/**
 * Gutenberg-shaped body. Later WP `content.rendered` goes into
 * `.journal-entry__body` as the same tags: p, h2, h3, blockquote, aside, ul.
 */
export type JournalBodyBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'note'; text: string; label?: string }
  | { type: 'ul'; items: readonly string[] }

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
  /** Long copy for the news/article page. Prefer `blocks` for mixed markup. */
  body?: readonly string[]
  /** Typed body blocks (paragraphs, headings, quote, note, list). */
  blocks?: readonly JournalBodyBlock[]
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
    imageSrc: '/img/about/2020-start.jpg',
    blocks: [
      {
        type: 'p',
        text: 'Открыли весенний сезон: в садовом центре снова можно выбрать многолетники, декоративные кустарники и хвойные к посадке.',
      },
      {
        type: 'quote',
        text: 'Если нужного сорта нет на площадке, менеджер уточнит поставку и оставит заявку. Не надо ждать, пока растение само появится на витрине.',
        cite: 'Грин Маркет, Берёзовский',
      },
      {
        type: 'p',
        text: 'Витрину обновили под текущий завоз. Перед визитом удобно свериться с каталогом на сайте и позвонить по наличию контейнера.',
      },
    ],
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
    imageSrc: '/img/about/2021-workshop.jpg',
    inHomeSlider: true,
    homeSliderOrder: 6,
  },
  {
    id: 'news-hours',
    kind: 'news',
    date: '2026-01-05',
    title: 'Режим работы в праздничные дни',
    excerpt: 'Садовый центр работает с 9:00 до 18:00 ежедневно. Перед визитом можно уточнить наличие по телефону.',
    imageSrc: '/img/about/2021-gobelin.jpg',
  },
  {
    id: 'article-soil',
    kind: 'articles',
    date: '2026-04-02',
    title: 'Как подготовить почву под декоративные кустарники',
    excerpt: 'Разбираем дренаж, структуру грунта и базовую подкормку перед высадкой весной.',
    imageSrc: '/img/about/2026-clematis.jpg',
    blocks: [
      {
        type: 'p',
        text: 'Перед посадкой декоративных кустарников смотрим, как уходит вода после дождя. На тяжёлой глине без дренажа корни быстро задыхаются.',
      },
      { type: 'h2', text: 'Грунт и кислотность' },
      {
        type: 'p',
        text: 'Грунт разрыхляем, добавляем компост и оставляем приствольный круг без плотной корки. Кислотность правим только если это требует конкретный вид, например гортензия или рододендрон.',
      },
      {
        type: 'note',
        label: 'К сведению',
        text: 'Первую подкормку даём после укоренения, а не в день посадки. Так меньше риск ожога молодых корней.',
      },
    ],
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
    imageSrc: '/img/about/2021-workshop.jpg',
    inHomeSlider: true,
    homeSliderOrder: 7,
  },
  {
    id: 'article-conifers',
    kind: 'articles',
    date: '2026-02-25',
    title: 'Хвойные в маленьком саду: компактные формы и сочетания',
    excerpt: 'Подборка низкорослых хвойных для клумбы, рокария и посадки у террасы.',
    imageSrc: '/img/catalog/hvoynye.20260904.png',
  },
  {
    id: 'article-roses',
    kind: 'articles',
    date: '2026-02-10',
    title: 'Розы для Урала: зимостойкие сорта и укрытие',
    excerpt: 'Какие группы роз лучше переносят зиму и как подготовить куст к морозам.',
    imageSrc: '/img/catalog/rozy.20260904.png',
  },
  {
    id: 'article-hydrangea',
    kind: 'articles',
    date: '2026-01-28',
    title: 'Гортензии: кислотность почвы и цвет соцветий',
    excerpt:
      'Как влияет pH на окраску и что учесть при посадке метельчатых и крупнолистных сортов.',
    imageSrc: '/img/catalog/gortenzii.20260904.png',
  },
  {
    id: 'article-lawn',
    kind: 'articles',
    date: '2026-01-14',
    title: 'Газон после зимы: ремонт проплешин и первый покос',
    excerpt: 'Пошаговый план весеннего ухода: аэрация, подсев и график стрижки.',
    imageSrc: '/img/about/2020-start.jpg',
  },
  {
    id: 'article-fruit',
    kind: 'articles',
    date: '2025-12-20',
    title: 'Плодовые для небольшого участка: колонны и карлики',
    excerpt: 'Как разместить яблони, груши и ягодники без затенения всего сада.',
    imageSrc: '/img/catalog/plodovo-yagodnye.20260904.png',
    imageAlt: 'Плодово-ягодные в садовом центре Грин Маркет',
    blocks: [
      {
        type: 'p',
        text: 'На шести сотках раскидистая яблоня быстро забирает свет у грядок и ягодников. Через несколько лет под ней уже не растут ни клубника, ни низкие кусты, а газон превращается в мох. Колонны и карлики оставляют дорожки, не закрывают окна и не превращают участок в сад-лес.',
      },
      {
        type: 'p',
        text: 'Типичная ошибка: купить «как у бабушки», потому что сорт знакомый. Знакомое имя на сеянце и то же имя на слаборослом подвое — разные деревья. Первое через пять лет занимает треть участка, второе держит крону в пределах двух-трёх метров и даёт урожай с земли.',
      },
      { type: 'h2', text: 'Почему не стоит сажать «как в деревне»' },
      {
        type: 'p',
        text: 'Сильнорослый сорт на сеянце выглядит скромно в контейнере. Потом разгоняется. Для Берёзовского и окрестностей смотрим зимостойкость и подвой, а не картинку взрослого дерева из европейского каталога. Там другое лето, другая зима и другой шаг посадки.',
      },
      {
        type: 'p',
        text: 'Подвой отвечает за силу роста, срок вступления в плодоношение и требовательность к поливу. Карлики начинают давать яблоки раньше, но без опоры в первые годы ствол гуляет. Полукарлики прощают больше ошибок и всё ещё умещаются на небольшом участке, если крону режут каждый год, а не «когда вспомнили».',
      },
      {
        type: 'quote',
        text: 'На шести сотках колонна кормит лучше, чем раскидистая яблоня у забора.',
        cite: 'из консультации в садовом центре Грин Маркет',
      },
      {
        type: 'p',
        text: 'Ещё один аргумент против высокорослых: обработка и сбор. Стремянка на узкой дорожке между грядкой и забором — это уже не романтика. Карликовую крону проще держать чашей, свет проходит внутрь, меньше парши на нижних ветках.',
      },
      { type: 'h2', text: 'Что помещается на 6 сотках' },
      {
        type: 'p',
        text: 'Считаем не «сколько хочется сортов», а сколько света и прохода останется после пятого года. Дом, баня, компост и теплица уже съели часть соток. Под плодовые оставляем полосу, которую реально косить, поливать и обрезать, не перелезая через кусты.',
      },
      { type: 'h3', text: 'Колонны и карлики' },
      {
        type: 'p',
        text: 'Колонновидные яблони сажают в ряд с шагом около метра. Им не нужна широкая крона, но нужна ровная линия и регулярная вырезка боковых побегов, иначе колонна расползается в ёлку. Карлики на слаборослом подвое просят кол или шпалеру в первые годы, зато урожай снимаем без стремянки.',
      },
      {
        type: 'p',
        text: 'Грушу на маленьком участке лучше одну, с подветренной стороны дома. Две груши «для опыления» часто сажают впритык и потом жалеют: крона груши тяжелее яблоневой, тень плотнее. Если опылитель нужен, его можно взять у соседа через забор или поставить второй сорт в контейнере у стены, а не в центре газона.',
      },
      {
        type: 'ul',
        items: [
          'Яблоня-колонна: 3–5 штук вдоль дорожки, шаг около метра',
          'Груша на карлике: одна, с подветренной стороны дома',
          'Смородина и жимолость: лента у забора, без конкуренции с яблоней',
        ],
      },
      {
        type: 'p',
        text: 'Ягодники в этом раскладе не приложение, а отдельная лента. Смородина и жимолость терпят полутень от забора, яблоня — нет. Если поставить всё в одну кучу «чтобы красиво», через два сезона кусты вытянутся, яблоки обмельчают, а обработка превратится в работу с одной лейкой на всех.',
      },
      {
        type: 'note',
        label: 'На площадке',
        text: 'В Берёзовском смотрите контейнер: карлик в C7,5 и крупномер в C20 — разные растения. На бирке должен быть подвой, не только сортовое имя.',
      },
      {
        type: 'p',
        text: 'Контейнер говорит о возрасте и объёме корня, не о будущем размере кроны. C20 может быть и карликом, которому просто дали подрасти в питомнике, и обычным деревом. Без подвоя на бирке это лотерея: через три года выяснится, что «компактный сорт» залез на крышу сарая.',
      },
      { type: 'h2', text: 'Свет и соседи' },
      {
        type: 'p',
        text: 'Плодовые ставим на юг и юго-запад. С северной стороны дома им не хватит уральского лета: цвет будет, завязь осыплется. Между кроной и грядкой оставляем минимум полтора метра. Иначе полив и обработка превращаются в квест, а томаты под яблоней ловят паршу раньше, чем покраснеют.',
      },
      {
        type: 'p',
        text: 'Не сажайте яблоню вплотную к септику, ливнёвке и отмостке. Корни ищут воду. Карлик спокойнее высокорослого, но даже он не любит застой после ливня. Если после дождя лужа стоит сутки, сначала дренаж и подъём посадочного места, потом дерево.',
      },
      { type: 'h3', text: 'Ягодники вдоль дорожки' },
      {
        type: 'p',
        text: 'Малину и ежевику лучше не мешать с яблонями: поросль лезет в приствольный круг и душит полив. Отдельная полоса с мульчей проще в уходе и не затеняет низ. Малину ограничивают лентой или коробом, иначе через три года это уже малинник, а не сад.',
      },
      {
        type: 'p',
        text: 'Жимолость зацветает рано, ей нужен свет весной, когда яблоня ещё без листьев. Поэтому жимолость можно ближе к плодовым, чем малину. Крыжовник и смородину держим у забора: им хватает солнца с одной стороны, а дорожка остаётся свободной для тачки.',
      },
      { type: 'h2', text: 'Посадка и первые два года' },
      {
        type: 'p',
        text: 'Яму готовим шире контейнера, не глубже корневой шейки. Заглубили прививку — сорт переходит на свои корни и через несколько лет обгоняет план. Слаборослый подвой особенно чувствителен: шейка должна быть видна после усадки грунта, не после первого сезона «само уйдёт».',
      },
      {
        type: 'p',
        text: 'В год посадки дерево поит регулярно, без фанатизма каждый вечер «чтобы наверняка». Перелив на глине губит быстрее засухи. Мульча из коры или скошенной травы без семян держит влагу и не даёт корке. Удобрения в лунку в день посадки не сыпем: сначала укоренение, потом еда.',
      },
      {
        type: 'p',
        text: 'На зиму молодой карлик привязываем к опоре, ствол защищаем от зайцев, приствольный круг не окучиваем навозом вплотную к коре. Весной смотрим прививку: если появилась поросль подвоя, вырезаем у основания, не оставляем «пока подрастёт». Иначе подвой съест сорт.',
      },
    ],
  },
  {
    id: 'article-pests',
    kind: 'articles',
    date: '2025-12-05',
    title: 'Тля и мучнистая роса: профилактика без лишней химии',
    excerpt: 'Ранние признаки, безопасные меры и когда уже нужна обработка.',
    imageSrc: '/img/catalog/mnogoletniki.20260904.png',
  },
  {
    id: 'article-containers',
    kind: 'articles',
    date: '2025-11-18',
    title: 'Контейнерный сад на террасе: грунт, дренаж и зимовка',
    excerpt: 'Что выбрать для кашпо, как поливать летом и куда убирать растения на зиму.',
    imageSrc: '/img/catalog/pryanye-travy.20260904.png',
  },
]

export function getJournalItemById(id: string) {
  return journalItems.find((item) => item.id === id) ?? null
}

const reservedJournalSlugs = new Set(['news', 'articles', 'events'])

export function journalEntryPath(id: string) {
  return `/blog/${id}`
}

export function isJournalEntryKind(kind: JournalKind) {
  return kind === 'news' || kind === 'articles'
}

export function journalCardHref(item: JournalItem) {
  if (item.href) {
    return item.href
  }

  if (!isJournalEntryKind(item.kind) || reservedJournalSlugs.has(item.id)) {
    return null
  }

  return journalEntryPath(item.id)
}

export function getJournalEntry(id: string) {
  if (reservedJournalSlugs.has(id)) {
    return null
  }

  const item = getJournalItemById(id)

  if (!item || !isJournalEntryKind(item.kind)) {
    return null
  }

  return item
}

export function listJournalEntryIds() {
  return journalItems
    .filter((item) => isJournalEntryKind(item.kind) && !reservedJournalSlugs.has(item.id))
    .map((item) => item.id)
}

export function getRelatedJournalEntries(item: JournalItem, limit = 2) {
  return journalItems
    .filter((entry) => entry.kind === item.kind && entry.id !== item.id)
    .slice(0, Math.max(0, limit))
}

export function formatJournalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return value
  }

  const [, year, month, day] = match
  return `${day}.${month}.${year}`
}

const fallbackJournalBlock: JournalBodyBlock = {
  type: 'p',
  text: 'Текст показан для приёмки вёрстки страницы. После подключения WordPress здесь будет полный материал редакции.',
}

export function journalEntryBlocks(item: JournalItem): JournalBodyBlock[] {
  if (item.blocks?.length) {
    return [...item.blocks]
  }

  if (item.body?.length) {
    return item.body.map((text) => ({ type: 'p' as const, text }))
  }

  return [fallbackJournalBlock]
}

export function journalEntryParagraphs(item: JournalItem) {
  return journalEntryBlocks(item).flatMap((block) => {
    if (block.type === 'ul') {
      return [...block.items]
    }

    return [block.text]
  })
}

/** Shared card + popup tags from admin fields (title stays on the item). */
export function getJournalEventTags(item: JournalItem) {
  return {
    timeLabel: item.timeLabel ?? null,
    priceLabel: item.priceLabel ?? null,
  }
}
