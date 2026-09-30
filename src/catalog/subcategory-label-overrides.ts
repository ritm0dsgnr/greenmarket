import type {
  PriceCatalogCategory,
  PriceCatalogProduct,
  PriceCatalogSnapshot,
  PriceCatalogSubcategory,
} from '../import/greenmarket-price/types'

type SubcategoryDisplayOverride = {
  label?: string
  rewriteProductName?: (name: string) => string
  rewriteProduct?: (product: PriceCatalogProduct) => PriceCatalogProduct
}

type OverrideEntry = string | SubcategoryDisplayOverride

/** Display labels / names that Excel grouping cannot express cleanly. */
const subcategoryDisplayOverrides: Readonly<
  Record<string, Readonly<Record<string, OverrideEntry>>>
> = {
  'plodovo-yagodnye': {
    yablonya: 'Яблоня плодовая',
    kalina: 'Калина плодовая',
    klyukva: 'Клюква садовая',
  },
  derevya: {
    yablonya: 'Яблоня декоративная',
  },
  'pryanye-travy': {
    rodiola: 'Родиола розовая\n(золотой корень)',
    monarda: {
      label: 'Монарда',
      rewriteProduct: (product) => {
        const name = product.name.replace(/^Монарда двойчатая/i, 'Монарда')
        return {
          ...product,
          name,
          nameTag: product.nameTag?.toLowerCase() === 'двойчатая' ? undefined : product.nameTag,
        }
      },
    },
    shalfey: 'Шалфей дубравный',
    issop: {
      label: 'Иссоп',
      rewriteProductName: (name) => name.replace(/\s*\(синий\)/gi, '').trim(),
    },
  },
  lukovichnye: {
    luk: 'Лук декоративный',
  },
  'zlaki-i-travy': {
    lugovik: 'Луговик дернистый\n(щучка)',
    lisohvost: {
      label: 'Лисохвост луговой',
      rewriteProductName: (name) =>
        name.replace(/^Лисохвост(?!\s+луговой)/i, 'Лисохвост луговой'),
    },
    sporobol: {
      label: 'Споробол\n(каплесемянник раскидистый)',
      rewriteProductName: (name) =>
        name.replace(/^Споробол\s*\(/i, 'Споробол\n('),
    },
  },
  liany: {
    zhimolost: {
      label: 'Жимолость вьющаяся',
      rewriteProductName: (name) =>
        name.replace(/^Жимолость(?!\s+вьющаяся)/i, 'Жимолость вьющаяся'),
    },
    vinograd: 'Виноград девичий\n(пятилисточковый)',
  },
  mnogoletniki: {
    badan: 'Бадан сердцелистный',
    barvinok: 'Барвинок малый',
    geran: 'Герань садовая',
    derbennik: 'Дербенник иволистный',
    doronikum: 'Дороникум восточный',
    zhivuchka: 'Живучка ползучая',
    liatris: 'Лиатрис колосковый',
    mak: 'Мак восточный',
    polyn: 'Полынь декоративная',
    helone: 'Хелоне косая',
    antennariya: {
      label: 'Антеннария',
      rewriteProductName: (name) =>
        name
          .replace(/\s*\([^)]*\)/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
    },
    delfinium: {
      label: 'Дельфиниум',
      rewriteProductName: (name) => name.replace(/^Дельфиниум высокий/i, 'Дельфиниум'),
    },
    ditsentra: {
      label: 'Дицентра',
      rewriteProductName: (name) =>
        name.replace(/^Дицентра красивая,?\s*розовая/i, 'Дицентра').trim(),
    },
    klopogon: {
      label: 'Клопогон',
      rewriteProductName: (name) => name.replace(/^Клопогон японский/i, 'Клопогон'),
    },
    kupalnitsa: {
      label: 'Купальница',
      rewriteProductName: (name) =>
        name.replace(/^Купальница китайская поздняя,?\s*оранжевая/i, 'Купальница').trim(),
    },
    medunitsa: {
      label: 'Медуница',
      rewriteProductName: (name) =>
        name
          .replace(/\s*\(розовые цветы\)/gi, '')
          .replace(/\s+/g, ' ')
          .trim(),
    },
    moroznik: {
      label: 'Морозник',
      rewriteProductName: (name) => name.replace(/^Морозник черный/i, 'Морозник'),
    },
    prostrel: {
      label: 'Прострел',
      rewriteProductName: (name) =>
        name
          .replace(/,?\s*фиолетовый$/i, '')
          .replace(/\s+/g, ' ')
          .trim(),
    },
  },
  'dekorativnye-kustarniki': {
    barbaris: 'Барбарис декоративный',
    kalina: {
      label: 'Калина декоративная',
      rewriteProduct: (product) => {
        const name = product.name.replace(/Калина обыкновенная/gi, 'Калина декоративная')

        return {
          ...product,
          name,
          nameTag:
            product.nameTag?.toLowerCase() === 'обыкновенная' ? 'декоративная' : product.nameTag,
        }
      },
    },
    mindal: 'Миндаль декоративный',
    puzyreplodnik: 'Пузыреплодник калинолистный',
    lapchatka: 'Лапчатка кустарниковая',
    smorodina: 'Смородина альпийская',
    forzitsiya: {
      label: 'Форзиция',
      rewriteProductName: (name) => name.replace(/^Форзиция промежуточная/i, 'Форзиция'),
    },
    zhimolost: {
      rewriteProductName: (name) =>
        name.replace(/Жимолость татарская\s*\(многоствольная\)/gi, 'Жимолость татарская'),
    },
    chubushnik: 'Чубушник\n(жасмин садовый)',
    snezhnoyagodnik: {
      label: 'Снежноягодник',
      rewriteProductName: (name) => name.replace(/^Снежноягодник розовый/i, 'Снежноягодник'),
    },
  },
}

function normalizeOverride(entry: OverrideEntry): SubcategoryDisplayOverride {
  if (typeof entry === 'string') {
    return { label: entry }
  }

  return entry
}

function applyProductOverrides(
  products: readonly PriceCatalogProduct[],
  override: SubcategoryDisplayOverride,
): PriceCatalogProduct[] {
  if (!override.rewriteProduct && !override.rewriteProductName) {
    return [...products]
  }

  return products.map((product) => {
    const next = override.rewriteProduct ? override.rewriteProduct(product) : product
    const name = override.rewriteProductName ? override.rewriteProductName(next.name) : next.name

    if (name === next.name && next === product) {
      return product
    }

    if (name === next.name) {
      return next
    }

    return { ...next, name }
  })
}

function applySubcategoryOverrides(
  categorySlug: string,
  subcategories: readonly PriceCatalogSubcategory[],
): PriceCatalogSubcategory[] {
  const bySlug = subcategoryDisplayOverrides[categorySlug]

  if (!bySlug) {
    return [...subcategories]
  }

  return subcategories.map((subcategory) => {
    const entry = bySlug[subcategory.slug]

    if (!entry) {
      return subcategory
    }

    const override = normalizeOverride(entry)
    const label = override.label ?? subcategory.label
    const products = applyProductOverrides(subcategory.products, override)

    if (label === subcategory.label && products === subcategory.products) {
      return subcategory
    }

    return { ...subcategory, label, products }
  })
}

function applyCategoryOverrides(category: PriceCatalogCategory): PriceCatalogCategory {
  return {
    ...category,
    subcategories: applySubcategoryOverrides(category.slug, category.subcategories),
  }
}

export function applySubcategoryLabelOverrides(snapshot: PriceCatalogSnapshot): PriceCatalogSnapshot {
  return {
    ...snapshot,
    categories: snapshot.categories.map(applyCategoryOverrides),
    groups: snapshot.groups.map((group) => ({
      ...group,
      items: group.items.map(applyCategoryOverrides),
    })),
  }
}

export function subcategoryLabelOverride(categorySlug: string, subcategorySlug: string) {
  const entry = subcategoryDisplayOverrides[categorySlug]?.[subcategorySlug]

  if (!entry) {
    return undefined
  }

  return normalizeOverride(entry).label
}

/** One-line label for breadcrumbs, SEO and lead copy. */
export function flattenCatalogLabel(label: string) {
  return label.replace(/\s*\n\s*/g, ' ').trim()
}
