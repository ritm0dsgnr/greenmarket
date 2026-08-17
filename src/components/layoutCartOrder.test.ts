import { describe, expect, it } from 'vitest'
import { formatLayoutOrderNumber, validateLayoutCartOrder } from './layoutCartOrder'

const filled = {
  name: 'Ольга',
  tel: '+7 (922) 145-60-85',
  email: 'olga@example.com',
  marketing: true,
  fulfillment: 'pickup' as const,
  buyer: 'person' as const,
  city: '',
  street: '',
  house: '',
  apartment: '',
}

describe('validateLayoutCartOrder', () => {
  it('requires name, phone, email and consent', () => {
    expect(validateLayoutCartOrder({ ...filled, name: '  ', tel: '', email: '', marketing: false })).toEqual({
      name: 'Укажите имя',
      tel: 'Укажите телефон',
      email: 'Укажите почту',
      marketing: 'Подтвердите согласие',
    })
  })

  it('rejects a short phone and an invalid email', () => {
    expect(validateLayoutCartOrder({ ...filled, tel: '922145', email: 'olga@' })).toEqual({
      tel: 'Укажите телефон полностью',
      email: 'Укажите почту полностью',
    })
  })

  it('accepts pickup without an address', () => {
    expect(validateLayoutCartOrder(filled)).toEqual({})
  })

  it('requires address fields for delivery', () => {
    expect(validateLayoutCartOrder({ ...filled, fulfillment: 'delivery' })).toEqual({
      city: 'Укажите город',
      street: 'Укажите улицу',
      house: 'Укажите дом',
    })
  })

  it('accepts a legal entity without a company name', () => {
    expect(validateLayoutCartOrder({ ...filled, buyer: 'company' })).toEqual({})
  })

  it('accepts delivery for a person', () => {
    expect(
      validateLayoutCartOrder({
        ...filled,
        fulfillment: 'delivery',
        city: 'Березовский',
        street: 'Рассветная',
        house: '1а',
        apartment: '2',
      }),
    ).toEqual({})
  })

  it('formats a public order number', () => {
    expect(formatLayoutOrderNumber(2026, 17)).toBe('GM-2026-00017')
  })
})
