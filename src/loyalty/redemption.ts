import { maxRedeemablePoints, parsePoints, pointsToMinor } from './money'
import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

export function validateRedemption(input: {
  readonly eligiblePlantAmountMinor: number
  readonly redeemPoints: number
  readonly customerPresentAtRegister: boolean
}): LoyaltyResult<{ redeemPoints: number; redeemedBonusMinor: number }> {
  const points = parsePoints(input.redeemPoints)

  if (!points.ok) {
    return points
  }

  if (points.value === 0) {
    return ok({ redeemPoints: 0, redeemedBonusMinor: 0 })
  }

  if (!input.customerPresentAtRegister) {
    return fail(LoyaltyErrorCode.CUSTOMER_NOT_PRESENT)
  }

  const maxPoints = maxRedeemablePoints(input.eligiblePlantAmountMinor)

  if (!maxPoints.ok) {
    return maxPoints
  }

  if (points.value > maxPoints.value) {
    return fail(LoyaltyErrorCode.REDEMPTION_EXCEEDS_LIMIT)
  }

  const redeemedBonusMinor = pointsToMinor(points.value)

  if (!redeemedBonusMinor.ok) {
    return redeemedBonusMinor
  }

  return ok({
    redeemPoints: points.value,
    redeemedBonusMinor: redeemedBonusMinor.value,
  })
}
