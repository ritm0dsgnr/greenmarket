import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'
import { describe, expect, it } from 'vitest'
import { buildSnapshot } from './parse-workbook'

const importDir = path.join(process.cwd(), 'data/import/greenmarket-price-v1')

describe('greenmarket price workbook', () => {
  it('parses sheets, subcategories and products from the current price file', () => {
    if (!fs.existsSync(importDir)) {
      // Local Excel source is gitignored; CI uses the generated catalog fixture instead.
      return
    }

    const files = fs.readdirSync(importDir).filter((name) => name.toLowerCase().endsWith('.xlsx'))
    expect(files.length).toBeGreaterThan(0)

    const sourceFile = path.join(importDir, files[0]!)
    const workbook = XLSX.readFile(sourceFile, { cellDates: false })
    const sheetRows = new Map<string, unknown[][]>()

    for (const sheetName of workbook.SheetNames) {
      sheetRows.set(
        sheetName,
        XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]!, {
          header: 1,
          defval: null,
        }) as unknown[][],
      )
    }

    const snapshot = buildSnapshot({
      sourceFile: files[0]!,
      sheetNames: workbook.SheetNames,
      sheetRows,
    })

    expect(snapshot.sheetCount).toBe(workbook.SheetNames.length)
    expect(snapshot.categories.length).toBeGreaterThan(0)
    expect(snapshot.productCount).toBeGreaterThan(100)

    const fruit = snapshot.categories.find((category) => category.label === 'Плодово-ягодные')
    expect(fruit?.subcategories.some((item) => item.label === 'Актинидия')).toBe(true)

    const conifers = snapshot.categories.find((category) => category.label === 'Хвойные')
    expect(conifers?.subcategories.map((item) => item.label)).toEqual(
      expect.arrayContaining(['Ель', 'Можжевельник', 'Лиственница']),
    )

    const spruce = conifers?.subcategories.find((item) => item.label === 'Ель')
    expect(spruce?.products.some((product) => product.nameTag === 'колючая')).toBe(true)

    const related = snapshot.categories.find((category) => category.label === 'Сопутствующие товары')
    expect(related?.subcategories.map((item) => item.label)).toEqual(
      expect.arrayContaining(['Садовый декор', 'Садовая одежда']),
    )

    const accessories = related?.subcategories.find((item) => item.label === 'Сопутствующие товары')
    expect(accessories?.products.some((product) => product.nameTag === 'Бордюр')).toBe(true)
    expect(accessories?.products.some((product) => product.nameTag === 'Грунт')).toBe(true)

    const containerValues = snapshot.categories.flatMap((category) =>
      category.subcategories.flatMap((subcategory) =>
        subcategory.products.flatMap((product) =>
          product.specs.filter((spec) => spec.label === 'Контейнер').map((spec) => spec.value),
        ),
      ),
    )
    expect(containerValues.some((value) => value.toLowerCase().includes('нет в наличии'))).toBe(false)
    expect(containerValues.some((value) => /[СсРр]/.test(value))).toBe(false)

    const boyaryshnik = snapshot.categories
      .find((category) => category.label === 'Деревья')
      ?.subcategories.find((item) => item.label === 'Боярышник')
      ?.products.find((product) => product.id === 'derevya-14')

    expect(boyaryshnik?.available).toBe(true)
    expect(boyaryshnik?.offers.some((offer) => offer.available)).toBe(true)
    expect(boyaryshnik?.offers.some((offer) => !offer.available)).toBe(true)
    expect(boyaryshnik?.specs.some((spec) => spec.value.toLowerCase().includes('нет в наличии'))).toBe(
      false,
    )
  })
})
