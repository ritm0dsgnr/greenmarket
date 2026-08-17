import { describe, expect, it } from 'vitest'
import { buildLayoutCartSheetRels, buildLayoutCartSheetXml, buildLayoutCartXlsx } from './exportLayoutCartExcel'
import type { LayoutCartLine } from './layoutCart'

const rose: LayoutCartLine = {
  id: '1:C3',
  productId: '1',
  name: 'Роза флорибунда',
  sizeLabel: 'C3',
  tag: 'sale',
  priceRubles: 1900,
  quantity: 2,
}

const soil: LayoutCartLine = {
  id: '3',
  productId: '3',
  name: 'Грунт универсальный',
  priceRubles: 650,
  quantity: 1,
}

describe('layout cart xlsx', () => {
  it('follows the cart export template', () => {
    const xml = buildLayoutCartSheetXml([rose, soil])

    expect(xml).toContain('ГРИН МАРКЕТ')
    expect(xml).toContain('Садовый центр &quot;Грин Маркет&quot;')
    expect(xml).toContain('Свердловская область, г. Березовский, ул. Рассветная 1а')
    expect(xml).toContain('+7 922 145 60 85')
    expect(xml).toContain('Режим работы:')
    expect(xml).toContain('С 9:00 до 18:00 ежедневно')
    expect(xml).toContain('Как к нам проехать:')
    expect(xml).toContain('https://vk.ru/green_market66')
    expect(xml).toContain('hyperlink ref="B9"')
    expect(xml).toContain('hyperlink ref="B12"')
    expect(xml).toContain('Ваш заказ')
    expect(xml).toContain('Количество, шт')
    expect(xml).toContain('Цена, руб')
    expect(xml).toContain('Сумма, руб')
    expect(xml).toContain('Роза флорибунда')
    expect(xml).toContain('Скидка, руб')
    expect(xml).toContain('Итого')
    expect(xml).toContain('SUM(C16:C17)')
    expect(xml).toContain('mergeCell ref="A1:A12"')
    expect(xml).toContain('mergeCell ref="A18:B18"')
    expect(xml).not.toContain('GREEN MARKET')
    expect(xml).not.toContain('КОНТАКТЫ')
    expect(xml).not.toContain('ИП Десятникова')
  })

  it('escapes cell text', () => {
    const xml = buildLayoutCartSheetXml([{ ...rose, name: 'Роза <hit> & sale' }])

    expect(xml).toContain('Роза &lt;hit&gt; &amp; sale')
    expect(xml).not.toContain('Роза <hit>')
  })

  it('builds an xlsx zip', () => {
    const bytes = buildLayoutCartXlsx([rose])

    expect(bytes[0]).toBe(0x50)
    expect(bytes[1]).toBe(0x4b)
    expect(bytes[2]).toBe(0x03)
    expect(bytes[3]).toBe(0x04)
  })

  it('links maps and vk as external hyperlinks', () => {
    const rels = buildLayoutCartSheetRels()

    expect(rels).toContain('TargetMode="External"')
    expect(rels).toContain('https://vk.ru/green_market66')
    expect(rels).toContain('https://yandex.ru/maps/29397/berezovskyi/?ll=60.875038%2C56.905446&amp;mode=poi')
  })
})
