import { calculateAccrualPoints, resolveAccrualRatePercent } from './accrual'
import { parseMinorAmount, parsePositiveMinorAmount } from './money'
import {
  allocateRedemption,
  availableBalancePoints,
  purchaseLotSchedule,
  type BonusLot,
  type RedemptionAllocation,
} from './lots'
import { LOYALTY_POLICY_VERSION } from './policy'
import { validateRedemption } from './redemption'
import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

const MAX_RECEIPT_REFERENCE_LENGTH = 64
const MAX_IDEMPOTENCY_KEY_LENGTH = 128
const MAX_REASON_LENGTH = 500

export type LedgerEntryType = 'accrual' | 'redemption' | 'refund' | 'adjustment'

export type PlannedPurchase = {
  readonly receiptReference: string
  readonly eligiblePlantAmountMinor: number
  readonly redeemedBonusMinor: number
  readonly netEligiblePlantAmountMinor: number
  readonly lifetimeAfterMinor: number
  readonly availableBalanceAfterPoints: number
  readonly policyVersion: typeof LOYALTY_POLICY_VERSION
  readonly redemption: {
    readonly pointsDelta: number
    readonly allocations: readonly RedemptionAllocation[]
  } | null
  readonly accrual: {
    readonly pointsDelta: number
    readonly ratePercent: 5 | 10
    readonly lot: BonusLot
  } | null
  readonly lotsAfter: BonusLot[]
}

export function parseReceiptReference(value: string): LoyaltyResult<string> {
  const receiptReference = value.trim()

  if (receiptReference.length === 0 || receiptReference.length > MAX_RECEIPT_REFERENCE_LENGTH) {
    return fail(LoyaltyErrorCode.INVALID_RECEIPT)
  }

  return ok(receiptReference)
}

export function parseIdempotencyKey(value: string): LoyaltyResult<string> {
  const idempotencyKey = value.trim()

  if (idempotencyKey.length === 0 || idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    return fail(LoyaltyErrorCode.INVALID_IDEMPOTENCY_KEY)
  }

  return ok(idempotencyKey)
}

export function parseCompensationReason(value: string): LoyaltyResult<string> {
  const reason = value.trim()

  if (reason.length === 0 || reason.length > MAX_REASON_LENGTH) {
    return fail(LoyaltyErrorCode.INVALID_REASON)
  }

  return ok(reason)
}

export function planPurchase(input: {
  readonly eligiblePlantAmountMinor: number
  readonly redeemPoints: number
  readonly customerPresentAtRegister: boolean
  readonly lifetimeBeforeMinor: number
  readonly lots: readonly BonusLot[]
  readonly now: Date
  readonly receiptReference: string
  readonly postedReceipts: ReadonlySet<string>
  readonly idempotencyKey: string
  readonly usedIdempotencyKeys: ReadonlySet<string>
  readonly purchaseLotId: string
}): LoyaltyResult<PlannedPurchase> {
  const receiptReference = parseReceiptReference(input.receiptReference)

  if (!receiptReference.ok) {
    return receiptReference
  }

  const idempotencyKey = parseIdempotencyKey(input.idempotencyKey)

  if (!idempotencyKey.ok) {
    return idempotencyKey
  }

  if (input.usedIdempotencyKeys.has(idempotencyKey.value)) {
    return fail(LoyaltyErrorCode.DUPLICATE_OPERATION)
  }

  if (input.postedReceipts.has(receiptReference.value)) {
    return fail(LoyaltyErrorCode.DUPLICATE_RECEIPT)
  }

  const eligiblePlantAmountMinor = parsePositiveMinorAmount(input.eligiblePlantAmountMinor)

  if (!eligiblePlantAmountMinor.ok) {
    return eligiblePlantAmountMinor
  }

  const lifetimeBeforeMinor = parseMinorAmount(input.lifetimeBeforeMinor)

  if (!lifetimeBeforeMinor.ok) {
    return lifetimeBeforeMinor
  }

  const redemption = validateRedemption({
    eligiblePlantAmountMinor: eligiblePlantAmountMinor.value,
    redeemPoints: input.redeemPoints,
    customerPresentAtRegister: input.customerPresentAtRegister,
  })

  if (!redemption.ok) {
    return redemption
  }

  const allocated = allocateRedemption(input.lots, redemption.value.redeemPoints, input.now)

  if (!allocated.ok) {
    return allocated
  }

  const netEligiblePlantAmountMinor =
    eligiblePlantAmountMinor.value - redemption.value.redeemedBonusMinor
  const rate = resolveAccrualRatePercent(lifetimeBeforeMinor.value, netEligiblePlantAmountMinor)

  if (!rate.ok) {
    return rate
  }

  const points = calculateAccrualPoints(netEligiblePlantAmountMinor, rate.value)

  if (!points.ok) {
    return points
  }

  const schedule = purchaseLotSchedule(input.now)
  const accrualLot: BonusLot | null =
    points.value === 0
      ? null
      : {
          id: input.purchaseLotId,
          kind: 'purchase',
          issuedPoints: points.value,
          consumedPoints: 0,
          availableAt: schedule.availableAt,
          expiresAt: schedule.expiresAt,
        }
  const lotsAfter = accrualLot === null ? allocated.value.lots : [...allocated.value.lots, accrualLot]

  return ok({
    receiptReference: receiptReference.value,
    eligiblePlantAmountMinor: eligiblePlantAmountMinor.value,
    redeemedBonusMinor: redemption.value.redeemedBonusMinor,
    netEligiblePlantAmountMinor,
    lifetimeAfterMinor: lifetimeBeforeMinor.value + netEligiblePlantAmountMinor,
    availableBalanceAfterPoints: availableBalancePoints(allocated.value.lots, input.now),
    policyVersion: LOYALTY_POLICY_VERSION,
    redemption:
      redemption.value.redeemPoints === 0
        ? null
        : {
            pointsDelta: -redemption.value.redeemPoints,
            allocations: allocated.value.allocations,
          },
    accrual:
      accrualLot === null
        ? null
        : {
            pointsDelta: points.value,
            ratePercent: rate.value,
            lot: accrualLot,
          },
    lotsAfter,
  })
}

export function planCompensation(input: {
  readonly originalType: LedgerEntryType
  readonly originalPointsDelta: number
  readonly alreadyReversed: boolean
  readonly reason: string
}): LoyaltyResult<{
  type: 'refund' | 'adjustment'
  pointsDelta: number
  reason: string
}> {
  const reason = parseCompensationReason(input.reason)

  if (!reason.ok) {
    return reason
  }

  if (input.alreadyReversed) {
    return fail(LoyaltyErrorCode.ALREADY_REVERSED)
  }

  if (input.originalType !== 'accrual' && input.originalType !== 'redemption') {
    return fail(LoyaltyErrorCode.COMPENSATION_NOT_ALLOWED)
  }

  if (!Number.isInteger(input.originalPointsDelta) || input.originalPointsDelta === 0) {
    return fail(LoyaltyErrorCode.INVALID_POINTS)
  }

  return ok({
    type: input.originalType === 'accrual' ? 'refund' : 'adjustment',
    pointsDelta: -input.originalPointsDelta,
    reason: reason.value,
  })
}
