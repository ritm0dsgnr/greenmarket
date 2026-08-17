import { describe, expect, it } from 'vitest'
import { maxRedeemablePoints } from './money'
import { KOPECKS_PER_RUBLE } from './policy'
import { LoyaltyErrorCode } from './result'
import { validateRedemption } from './redemption'

describe('redemption', () => {
  it('caps redemption at 50% of the plant amount in whole bonuses', () => {
    expect(maxRedeemablePoints(200 * KOPECKS_PER_RUBLE)).toEqual({ ok: true, value: 100 })
    expect(maxRedeemablePoints(199 * KOPECKS_PER_RUBLE)).toEqual({ ok: true, value: 99 })
  })

  it('requires the customer to be present at the register before spending points', () => {
    expect(
      validateRedemption({
        eligiblePlantAmountMinor: 200 * KOPECKS_PER_RUBLE,
        redeemPoints: 50,
        customerPresentAtRegister: false,
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.CUSTOMER_NOT_PRESENT })
  })

  it('rejects a spend above the 50% cap', () => {
    expect(
      validateRedemption({
        eligiblePlantAmountMinor: 200 * KOPECKS_PER_RUBLE,
        redeemPoints: 101,
        customerPresentAtRegister: true,
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.REDEMPTION_EXCEEDS_LIMIT })
  })

  it('allows a zero spend without presence confirmation', () => {
    expect(
      validateRedemption({
        eligiblePlantAmountMinor: 200 * KOPECKS_PER_RUBLE,
        redeemPoints: 0,
        customerPresentAtRegister: false,
      }),
    ).toEqual({ ok: true, value: { redeemPoints: 0, redeemedBonusMinor: 0 } })
  })
})
