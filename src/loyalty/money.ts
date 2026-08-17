import { KOPECKS_PER_RUBLE, REDEMPTION_LIMIT_PERCENT } from './policy'
import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

export function isSafeNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && Number.isSafeInteger(value) && value >= 0
}

export function parseMinorAmount(value: number): LoyaltyResult<number> {
  if (!isSafeNonNegativeInteger(value)) {
    return fail(LoyaltyErrorCode.INVALID_MONEY)
  }

  return ok(value)
}

export function parsePositiveMinorAmount(value: number): LoyaltyResult<number> {
  const parsed = parseMinorAmount(value)

  if (!parsed.ok) {
    return parsed
  }

  if (parsed.value === 0) {
    return fail(LoyaltyErrorCode.INVALID_MONEY)
  }

  return parsed
}

export function parsePoints(value: number): LoyaltyResult<number> {
  if (!isSafeNonNegativeInteger(value)) {
    return fail(LoyaltyErrorCode.INVALID_POINTS)
  }

  return ok(value)
}

export function pointsToMinor(points: number): LoyaltyResult<number> {
  const parsed = parsePoints(points)

  if (!parsed.ok) {
    return parsed
  }

  const minor = parsed.value * KOPECKS_PER_RUBLE

  if (!Number.isSafeInteger(minor)) {
    return fail(LoyaltyErrorCode.INVALID_MONEY)
  }

  return ok(minor)
}

export function maxRedeemablePoints(eligiblePlantAmountMinor: number): LoyaltyResult<number> {
  const parsed = parsePositiveMinorAmount(eligiblePlantAmountMinor)

  if (!parsed.ok) {
    return parsed
  }

  return ok(Math.floor((parsed.value * REDEMPTION_LIMIT_PERCENT) / (100 * KOPECKS_PER_RUBLE)))
}
