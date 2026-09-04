import { describe, expect, it } from 'vitest'
import { normalizeContainerValue, normalizeSpecFilterValue } from './normalize-container'

describe('normalizeContainerValue', () => {
  it('latinizes Cyrillic lookalikes in container codes', () => {
    expect(normalizeContainerValue('С2')).toBe('C2')
    expect(normalizeContainerValue('C2')).toBe('C2')
    expect(normalizeContainerValue('Р9')).toBe('P9')
    expect(normalizeContainerValue('P9')).toBe('P9')
    expect(normalizeContainerValue('С3/С5')).toBe('C3/C5')
    expect(normalizeContainerValue('C10/С15')).toBe('C10/C15')
    expect(normalizeContainerValue('С3 (пакет)')).toBe('C3 (пакет)')
  })

  it('normalizes only container specs for filters', () => {
    expect(normalizeSpecFilterValue('Контейнер', 'С5')).toBe('C5')
    expect(normalizeSpecFilterValue('Цвет', 'Светлый')).toBe('Светлый')
  })
})
