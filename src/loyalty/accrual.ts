import {
  ACCRUAL_RATE_PERCENT_AT_OR_ABOVE_THRESHOLD,
  ACCRUAL_RATE_PERCENT_BELOW_THRESHOLD,
  KOPECKS_PER_RUBLE,
  THRESHOLD_PLANT_AMOUNT_MINOR,
} from './policy'
import { parseMinorAmount, parsePositiveMinorAmount } from './money'
import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

export type AccrualRatePercent =
  | typeof ACCRUAL_RATE_PERCENT_BELOW_THRESHOLD
  | typeof ACCRUAL_RATE_PERCENT_AT_OR_ABOVE_THRESHOLD

export function remainingToThresholdMinor(lifetimeNetEligiblePlantAmountMinor: number): LoyaltyResult<number> {
  const parsed = parseMinorAmount(lifetimeNetEligiblePlantAmountMinor)

  if (!parsed.ok) {
    return parsed
  }

  return ok(Math.max(0, THRESHOLD_PLANT_AMOUNT_MINOR - parsed.value))
}

export function resolveAccrualRatePercent(
  lifetimeBeforeMinor: number,
  netEligibleThisCheckMinor: number,
): LoyaltyResult<AccrualRatePercent> {
  const lifetime = parseMinorAmount(lifetimeBeforeMinor)
  const net = parseMinorAmount(netEligibleThisCheckMinor)

  if (!lifetime.ok) {
    return lifetime
  }

  if (!net.ok) {
    return net
  }

  const after = lifetime.value + net.value

  if (!Number.isSafeInteger(after)) {
    return fail(LoyaltyErrorCode.INVALID_MONEY)
  }

  return ok(
    after >= THRESHOLD_PLANT_AMOUNT_MINOR
      ? ACCRUAL_RATE_PERCENT_AT_OR_ABOVE_THRESHOLD
      : ACCRUAL_RATE_PERCENT_BELOW_THRESHOLD,
  )
}

export function calculateAccrualPoints(
  netEligiblePlantAmountMinor: number,
  ratePercent: AccrualRatePercent,
): LoyaltyResult<number> {
  const parsed = parsePositiveMinorAmount(netEligiblePlantAmountMinor)

  if (!parsed.ok) {
    return parsed
  }

  return ok(Math.floor((parsed.value * ratePercent) / (KOPECKS_PER_RUBLE * 100)))
}
