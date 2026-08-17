import { remainingToThresholdMinor, resolveAccrualRatePercent } from './accrual'
import { startOfNextZonedDay } from './calendar'
import {
  availableBalancePoints,
  isLotAvailable,
  remainingLotPoints,
  type BonusLot,
} from './lots'
import { BONUS_PROGRAM_PATH } from './policy'
import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

export type TelegramHistoryItem = {
  readonly occurredAt: Date
  readonly type: 'accrual' | 'redemption' | 'refund' | 'adjustment'
  readonly pointsDelta: number
  readonly plantAmountMinor: number | null
  readonly availableBalanceAfterPoints: number
}

export type TelegramExpiringLot = {
  readonly points: number
  readonly expiresAt: Date
}

export type TelegramCustomerView = {
  readonly availablePoints: number
  readonly activatingTomorrowPoints: number
  readonly accrualRatePercent: 5 | 10
  readonly remainingToThresholdMinor: number
  readonly history: readonly TelegramHistoryItem[]
  readonly expiringLots: readonly TelegramExpiringLot[]
  readonly termsUrl: string
}

export function parseBonusProgramUrl(value: string): LoyaltyResult<string> {
  try {
    const url = new URL(value)

    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      url.pathname !== BONUS_PROGRAM_PATH ||
      url.search !== '' ||
      url.hash !== ''
    ) {
      return fail(LoyaltyErrorCode.INVALID_TERMS_URL)
    }

    return ok(`${url.origin}${BONUS_PROGRAM_PATH}`)
  } catch {
    return fail(LoyaltyErrorCode.INVALID_TERMS_URL)
  }
}

export function projectTelegramCustomerView(input: {
  readonly lots: readonly BonusLot[]
  readonly lifetimeNetEligiblePlantAmountMinor: number
  readonly history: readonly TelegramHistoryItem[]
  readonly now: Date
  readonly termsUrl: string
}): LoyaltyResult<TelegramCustomerView> {
  const termsUrl = parseBonusProgramUrl(input.termsUrl)

  if (!termsUrl.ok) {
    return termsUrl
  }

  const remaining = remainingToThresholdMinor(input.lifetimeNetEligiblePlantAmountMinor)

  if (!remaining.ok) {
    return remaining
  }

  const rate = resolveAccrualRatePercent(input.lifetimeNetEligiblePlantAmountMinor, 0)

  if (!rate.ok) {
    return rate
  }

  const tomorrow = startOfNextZonedDay(input.now).getTime()

  return ok({
    availablePoints: availableBalancePoints(input.lots, input.now),
    activatingTomorrowPoints: input.lots.reduce((total, lot) => {
      if (lot.availableAt.getTime() === tomorrow) {
        return total + remainingLotPoints(lot)
      }

      return total
    }, 0),
    accrualRatePercent: rate.value,
    remainingToThresholdMinor: remaining.value,
    history: input.history,
    expiringLots: input.lots
      .filter((lot) => isLotAvailable(lot, input.now))
      .sort((left, right) => left.expiresAt.getTime() - right.expiresAt.getTime())
      .map((lot) => ({
        points: remainingLotPoints(lot),
        expiresAt: lot.expiresAt,
      })),
    termsUrl: termsUrl.value,
  })
}
