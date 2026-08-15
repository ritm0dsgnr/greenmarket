export type LayoutCartFulfillment = 'pickup' | 'delivery'
export type LayoutCartBuyer = 'person' | 'company'

export type LayoutCartOrderValues = {
  name: string
  tel: string
  email: string
  marketing: boolean
  fulfillment: LayoutCartFulfillment
  buyer: LayoutCartBuyer
  city: string
  street: string
  house: string
  apartment: string
}

export type LayoutCartOrderField = keyof LayoutCartOrderValues

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLayoutCartOrder(values: LayoutCartOrderValues): Partial<Record<LayoutCartOrderField, string>> {
  const errors: Partial<Record<LayoutCartOrderField, string>> = {}
  const name = values.name.trim()
  const tel = values.tel.trim()
  const email = values.email.trim()
  const phoneDigits = tel.replace(/\D/g, '')

  if (!name) {
    errors.name = 'Укажите имя'
  }

  if (!phoneDigits) {
    errors.tel = 'Укажите телефон'
  } else if (phoneDigits.length < 10) {
    errors.tel = 'Укажите телефон полностью'
  }

  if (!email) {
    errors.email = 'Укажите почту'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Укажите почту полностью'
  }

  if (values.fulfillment === 'delivery') {
    if (!values.city.trim()) {
      errors.city = 'Укажите город'
    }

    if (!values.street.trim()) {
      errors.street = 'Укажите улицу'
    }

    if (!values.house.trim()) {
      errors.house = 'Укажите дом'
    }
  }

  if (!values.marketing) {
    errors.marketing = 'Подтвердите согласие'
  }

  return errors
}

export function formatLayoutOrderNumber(year: number, serial: number) {
  return `GM-${year}-${String(serial).padStart(5, '0')}`
}

export function createLayoutOrderNumber(now = new Date()) {
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  const serial = 1 + ((bytes[0] ?? 0) % 99999)

  return formatLayoutOrderNumber(now.getFullYear(), serial)
}
