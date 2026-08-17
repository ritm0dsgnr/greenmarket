import { addCalendarYears, calendarDateFromInstant, startOfNextZonedDay, startOfZonedDay } from './calendar'
import { PURCHASE_LOT_EXPIRES_AFTER_YEARS } from './policy'
import { parsePoints } from './money'
import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

export type BonusLotKind = 'purchase' | 'birthday'

export type BonusLot = {
  readonly id: string
  readonly kind: BonusLotKind
  readonly issuedPoints: number
  readonly consumedPoints: number
  readonly availableAt: Date
  readonly expiresAt: Date
}

export type RedemptionAllocation = {
  readonly lotId: string
  readonly pointsSpent: number
}

export function remainingLotPoints(lot: BonusLot): number {
  return lot.issuedPoints - lot.consumedPoints
}

export function isLotAvailable(lot: BonusLot, now: Date): boolean {
  return (
    remainingLotPoints(lot) > 0 &&
    lot.availableAt.getTime() <= now.getTime() &&
    lot.expiresAt.getTime() > now.getTime()
  )
}

export function availableBalancePoints(lots: readonly BonusLot[], now: Date): number {
  return lots.reduce((total, lot) => total + (isLotAvailable(lot, now) ? remainingLotPoints(lot) : 0), 0)
}

export function purchaseLotSchedule(now: Date): { availableAt: Date; expiresAt: Date } {
  const availableAt = startOfNextZonedDay(now)
  const expiresAt = startOfZonedDay(
    addCalendarYears(calendarDateFromInstant(availableAt), PURCHASE_LOT_EXPIRES_AFTER_YEARS),
  )

  return { availableAt, expiresAt }
}

export function allocateRedemption(
  lots: readonly BonusLot[],
  points: number,
  now: Date,
): LoyaltyResult<{ allocations: RedemptionAllocation[]; lots: BonusLot[] }> {
  const parsed = parsePoints(points)

  if (!parsed.ok) {
    return parsed
  }

  if (parsed.value === 0) {
    return ok({ allocations: [], lots: [...lots] })
  }

  if (availableBalancePoints(lots, now) < parsed.value) {
    return fail(LoyaltyErrorCode.INSUFFICIENT_BALANCE)
  }

  const ordered = [...lots].sort(compareLotsForRedemption)
  const allocations: RedemptionAllocation[] = []
  let remaining = parsed.value
  const nextLots: BonusLot[] = []

  for (const lot of ordered) {
    if (remaining === 0 || !isLotAvailable(lot, now)) {
      nextLots.push(lot)
      continue
    }

    const spend = Math.min(remainingLotPoints(lot), remaining)
    remaining -= spend
    allocations.push({ lotId: lot.id, pointsSpent: spend })
    nextLots.push({ ...lot, consumedPoints: lot.consumedPoints + spend })
  }

  if (remaining > 0) {
    return fail(LoyaltyErrorCode.INSUFFICIENT_BALANCE)
  }

  return ok({ allocations, lots: nextLots })
}

function compareLotsForRedemption(left: BonusLot, right: BonusLot): number {
  const expires = left.expiresAt.getTime() - right.expiresAt.getTime()

  if (expires !== 0) {
    return expires
  }

  const available = left.availableAt.getTime() - right.availableAt.getTime()

  if (available !== 0) {
    return available
  }

  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0
}
