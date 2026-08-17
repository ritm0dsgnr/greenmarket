import { describe, expect, it } from 'vitest'
import { normalizePhone } from './phone'
import { LoyaltyErrorCode } from './result'

describe('normalizePhone', () => {
  it('normalizes Russian formats to +7 and 10 national digits', () => {
    expect(normalizePhone('+7 (900) 000-00-01')).toEqual({ ok: true, value: '+79000000001' })
    expect(normalizePhone('8 900 000-00-01')).toEqual({ ok: true, value: '+79000000001' })
    expect(normalizePhone('9000000001')).toEqual({ ok: true, value: '+79000000001' })
  })

  it('rejects incomplete, foreign and non-numeric values', () => {
    expect(normalizePhone('123')).toEqual({ ok: false, code: LoyaltyErrorCode.INVALID_PHONE })
    expect(normalizePhone('+19990000001')).toEqual({ ok: false, code: LoyaltyErrorCode.INVALID_PHONE })
    expect(normalizePhone('79000abc001')).toEqual({ ok: false, code: LoyaltyErrorCode.INVALID_PHONE })
    expect(normalizePhone('0000000000')).toEqual({ ok: false, code: LoyaltyErrorCode.INVALID_PHONE })
  })
})
