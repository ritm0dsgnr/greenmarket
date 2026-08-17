import { describe, expect, it } from 'vitest'
import { calculateAccrualPoints, remainingToThresholdMinor, resolveAccrualRatePercent } from './accrual'
import { KOPECKS_PER_RUBLE, THRESHOLD_PLANT_AMOUNT_MINOR } from './policy'
import { LoyaltyErrorCode } from './result'

describe('accrual', () => {
  it('keeps 5% below the threshold and switches the whole check to 10% when the threshold is reached', () => {
    expect(resolveAccrualRatePercent(140_000 * KOPECKS_PER_RUBLE, 9_999 * KOPECKS_PER_RUBLE)).toEqual({
      ok: true,
      value: 5,
    })
    expect(resolveAccrualRatePercent(140_000 * KOPECKS_PER_RUBLE, 10_000 * KOPECKS_PER_RUBLE)).toEqual({
      ok: true,
      value: 10,
    })
    expect(resolveAccrualRatePercent(THRESHOLD_PLANT_AMOUNT_MINOR, 100 * KOPECKS_PER_RUBLE)).toEqual({
      ok: true,
      value: 10,
    })
  })

  it('rounds accrual down to a whole bonus', () => {
    expect(calculateAccrualPoints(199 * KOPECKS_PER_RUBLE, 5)).toEqual({ ok: true, value: 9 })
    expect(calculateAccrualPoints(20_000 * KOPECKS_PER_RUBLE, 10)).toEqual({ ok: true, value: 2_000 })
    expect(calculateAccrualPoints(1 * KOPECKS_PER_RUBLE, 5)).toEqual({ ok: true, value: 0 })
  })

  it('reports remaining plant purchases until 10%', () => {
    expect(remainingToThresholdMinor(149_000 * KOPECKS_PER_RUBLE)).toEqual({
      ok: true,
      value: 1_000 * KOPECKS_PER_RUBLE,
    })
    expect(remainingToThresholdMinor(THRESHOLD_PLANT_AMOUNT_MINOR)).toEqual({ ok: true, value: 0 })
  })

  it('rejects non-integer money', () => {
    expect(resolveAccrualRatePercent(1.5, 100)).toEqual({ ok: false, code: LoyaltyErrorCode.INVALID_MONEY })
    expect(calculateAccrualPoints(0, 5)).toEqual({ ok: false, code: LoyaltyErrorCode.INVALID_MONEY })
  })
})
