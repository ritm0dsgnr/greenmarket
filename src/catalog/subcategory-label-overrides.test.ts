import { describe, expect, it } from 'vitest'
import type { PriceCatalogSnapshot } from '../import/greenmarket-price/types'
import {
  applySubcategoryLabelOverrides,
  subcategoryLabelOverride,
} from './subcategory-label-overrides'

const sampleSnapshot = {
  sourceFile: 'fixture.xlsx',
  generatedAt: '2026-09-29T00:00:00.000Z',
  sheetCount: 2,
  productCount: 2,
  groups: [
    {
      title: 'Растения',
      items: [
        {
          slug: 'plodovo-yagodnye',
          label: 'Плодово-ягодные',
          href: '/catalog/plodovo-yagodnye',
          subcategories: [
            {
              slug: 'yablonya',
              label: 'Яблоня',
              products: [
                {
                  id: 'plodovo-yagodnye-1',
                  sourceRowNumber: 1,
                  name: 'Яблоня "Аксёна"',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
            { slug: 'kalina', label: 'Калина', products: [] },
          ],
        },
        {
          slug: 'derevya',
          label: 'Деревья',
          href: '/catalog/derevya',
          subcategories: [
            {
              slug: 'yablonya',
              label: 'Яблоня',
              products: [
                {
                  id: 'derevya-1',
                  sourceRowNumber: 1,
                  name: 'Яблоня декоративная "Малиновка"',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
          ],
        },
        {
          slug: 'dekorativnye-kustarniki',
          label: 'Кустарники',
          href: '/catalog/dekorativnye-kustarniki',
          subcategories: [
            { slug: 'barbaris', label: 'Барбарис', products: [] },
            {
              slug: 'kalina',
              label: 'Калина',
              products: [
                {
                  id: 'kust-k-1',
                  sourceRowNumber: 1,
                  name: 'Калина обыкновенная "Roseum"',
                  nameTag: 'обыкновенная',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
            { slug: 'mindal', label: 'Миндаль', products: [] },
            { slug: 'puzyreplodnik', label: 'Пузыреплодник', products: [] },
            { slug: 'lapchatka', label: 'Лапчатка', products: [] },
            { slug: 'smorodina', label: 'Смородина', products: [] },
            {
              slug: 'zhimolost',
              label: 'Жимолость',
              products: [
                {
                  id: 'kust-z-1',
                  sourceRowNumber: 1,
                  name: 'Жимолость татарская (многоствольная)',
                  nameTag: 'татарская',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
            {
              slug: 'forzitsiya',
              label: 'Форзиция',
              products: [
                {
                  id: 'kust-f-1',
                  sourceRowNumber: 1,
                  name: 'Форзиция промежуточная "Spectabilis"',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
            { slug: 'chubushnik', label: 'Чубушник', products: [] },
            {
              slug: 'snezhnoyagodnik',
              label: 'Снежноягодник',
              products: [
                {
                  id: 'kust-s-1',
                  sourceRowNumber: 1,
                  name: 'Снежноягодник розовый "Mother of pearl"',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  categories: [
    {
      slug: 'plodovo-yagodnye',
      label: 'Плодово-ягодные',
      href: '/catalog/plodovo-yagodnye',
      subcategories: [
        {
          slug: 'yablonya',
          label: 'Яблоня',
          products: [
            {
              id: 'plodovo-yagodnye-1',
              sourceRowNumber: 1,
              name: 'Яблоня "Аксёна"',
              available: true,
              specs: [],
              offers: [],
            },
          ],
        },
        { slug: 'kalina', label: 'Калина', products: [] },
      ],
    },
    {
      slug: 'derevya',
      label: 'Деревья',
      href: '/catalog/derevya',
      subcategories: [
        {
          slug: 'yablonya',
          label: 'Яблоня',
          products: [
            {
              id: 'derevya-1',
              sourceRowNumber: 1,
              name: 'Яблоня декоративная "Малиновка"',
              available: true,
              specs: [],
              offers: [],
            },
          ],
        },
      ],
    },
    {
      slug: 'dekorativnye-kustarniki',
      label: 'Кустарники',
      href: '/catalog/dekorativnye-kustarniki',
      subcategories: [
        { slug: 'barbaris', label: 'Барбарис', products: [] },
        {
          slug: 'kalina',
          label: 'Калина',
          products: [
            {
              id: 'kust-k-1',
              sourceRowNumber: 1,
              name: 'Калина обыкновенная "Roseum"',
              nameTag: 'обыкновенная',
              available: true,
              specs: [],
              offers: [],
            },
          ],
        },
        { slug: 'mindal', label: 'Миндаль', products: [] },
        { slug: 'puzyreplodnik', label: 'Пузыреплодник', products: [] },
        { slug: 'lapchatka', label: 'Лапчатка', products: [] },
        { slug: 'smorodina', label: 'Смородина', products: [] },
        {
          slug: 'zhimolost',
          label: 'Жимолость',
          products: [
            {
              id: 'kust-z-1',
              sourceRowNumber: 1,
              name: 'Жимолость татарская (многоствольная)',
              nameTag: 'татарская',
              available: true,
              specs: [],
              offers: [],
            },
          ],
        },
        {
          slug: 'forzitsiya',
          label: 'Форзиция',
          products: [
            {
              id: 'kust-f-1',
              sourceRowNumber: 1,
              name: 'Форзиция промежуточная "Spectabilis"',
              available: true,
              specs: [],
              offers: [],
            },
          ],
        },
        { slug: 'chubushnik', label: 'Чубушник', products: [] },
        {
          slug: 'snezhnoyagodnik',
          label: 'Снежноягодник',
          products: [
            {
              id: 'kust-s-1',
              sourceRowNumber: 1,
              name: 'Снежноягодник розовый "Mother of pearl"',
              available: true,
              specs: [],
              offers: [],
            },
          ],
        },
      ],
    },
  ],
} satisfies PriceCatalogSnapshot

describe('applySubcategoryLabelOverrides', () => {
  it('renames apple groups in fruit and trees sections', () => {
    expect(subcategoryLabelOverride('plodovo-yagodnye', 'yablonya')).toBe('Яблоня плодовая')
    expect(subcategoryLabelOverride('plodovo-yagodnye', 'kalina')).toBe('Калина плодовая')
    expect(subcategoryLabelOverride('derevya', 'yablonya')).toBe('Яблоня декоративная')

    const next = applySubcategoryLabelOverrides(sampleSnapshot)
    const fruit = next.categories.find((item) => item.slug === 'plodovo-yagodnye')
    const trees = next.categories.find((item) => item.slug === 'derevya')

    expect(fruit?.subcategories.find((item) => item.slug === 'yablonya')?.label).toBe('Яблоня плодовая')
    expect(fruit?.subcategories.find((item) => item.slug === 'kalina')?.label).toBe('Калина плодовая')
    expect(trees?.subcategories[0]?.label).toBe('Яблоня декоративная')
    expect(next.groups[0]?.items[0]?.subcategories.find((item) => item.slug === 'yablonya')?.label).toBe(
      'Яблоня плодовая',
    )
    expect(next.groups[0]?.items[1]?.subcategories[0]?.label).toBe('Яблоня декоративная')
  })

  it('renames shrub groups in decorative shrubs section', () => {
    const next = applySubcategoryLabelOverrides(sampleSnapshot)
    const shrubs = next.categories.find((item) => item.slug === 'dekorativnye-kustarniki')
    const bySlug = Object.fromEntries((shrubs?.subcategories ?? []).map((item) => [item.slug, item.label]))

    expect(bySlug).toMatchObject({
      barbaris: 'Барбарис декоративный',
      kalina: 'Калина декоративная',
      mindal: 'Миндаль декоративный',
      puzyreplodnik: 'Пузыреплодник калинолистный',
      lapchatka: 'Лапчатка кустарниковая',
      smorodina: 'Смородина альпийская',
      forzitsiya: 'Форзиция',
      chubushnik: 'Чубушник\n(жасмин садовый)',
      snezhnoyagodnik: 'Снежноягодник',
    })
  })

  it('rewrites herb group labels and names in spicy herbs', () => {
    const snapshot = {
      ...sampleSnapshot,
      categories: [
        {
          slug: 'pryanye-travy',
          label: 'Пряные травы',
          href: '/catalog/pryanye-travy',
          subcategories: [
            {
              slug: 'rodiola',
              label: 'Родиола',
              products: [
                {
                  id: 'h-1',
                  sourceRowNumber: 1,
                  name: 'Родиола розовая (золотой корень)',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
            {
              slug: 'monarda',
              label: 'Монарда',
              products: [
                {
                  id: 'h-2',
                  sourceRowNumber: 2,
                  name: 'Монарда двойчатая "Панорама"',
                  nameTag: 'двойчатая',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
            {
              slug: 'shalfey',
              label: 'Шалфей',
              products: [
                {
                  id: 'h-3',
                  sourceRowNumber: 3,
                  name: 'Шалфей дубравный "Карадонна"',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
            {
              slug: 'issop',
              label: 'Иссоп',
              products: [
                {
                  id: 'h-4',
                  sourceRowNumber: 4,
                  name: 'Иссоп лекарственный (синий)',
                  available: true,
                  specs: [],
                  offers: [],
                },
              ],
            },
          ],
        },
      ],
      groups: [],
    }

    const next = applySubcategoryLabelOverrides(snapshot)
    const herbs = next.categories[0]
    const bySlug = Object.fromEntries((herbs?.subcategories ?? []).map((item) => [item.slug, item]))

    expect(bySlug.rodiola?.label).toBe('Родиола розовая\n(золотой корень)')
    expect(bySlug.monarda?.products[0]?.name).toBe('Монарда "Панорама"')
    expect(bySlug.monarda?.products[0]?.nameTag).toBeUndefined()
    expect(bySlug.shalfey?.label).toBe('Шалфей дубравный')
    expect(bySlug.issop?.products[0]?.name).toBe('Иссоп лекарственный')
  })

  it('rewrites shrub product names for display', () => {
    const next = applySubcategoryLabelOverrides(sampleSnapshot)
    const shrubs = next.categories.find((item) => item.slug === 'dekorativnye-kustarniki')
    const kalina = shrubs?.subcategories.find((item) => item.slug === 'kalina')
    const forzitsiya = shrubs?.subcategories.find((item) => item.slug === 'forzitsiya')
    const zhimolost = shrubs?.subcategories.find((item) => item.slug === 'zhimolost')
    const snowberry = shrubs?.subcategories.find((item) => item.slug === 'snezhnoyagodnik')

    expect(kalina?.products[0]?.name).toBe('Калина декоративная "Roseum"')
    expect(kalina?.products[0]?.nameTag).toBe('декоративная')
    expect(forzitsiya?.products[0]?.name).toBe('Форзиция "Spectabilis"')
    expect(zhimolost?.products[0]?.name).toBe('Жимолость татарская')
    expect(snowberry?.products[0]?.name).toBe('Снежноягодник "Mother of pearl"')
  })
})
