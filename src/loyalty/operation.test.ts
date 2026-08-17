import { describe, expect, it } from 'vitest'
import { startOfZonedDay } from './calendar'
import type { BonusLot } from './lots'
import { KOPECKS_PER_RUBLE } from './policy'
import { planCompensation, planPurchase } from './operation'
import { LoyaltyErrorCode } from './result'

function openLot(id: string, points: number): BonusLot {
  return {
    id,
    kind: 'purchase',
    issuedPoints: points,
    consumedPoints: 0,
    availableAt: startOfZonedDay({ year: 2026, month: 8, day: 17 }),
    expiresAt: startOfZonedDay({ year: 2027, month: 8, day: 17 }),
  }
}

function purchaseInput(overrides: Partial<Parameters<typeof planPurchase>[0]> = {}) {
  return {
    eligiblePlantAmountMinor: 20_000 * KOPECKS_PER_RUBLE,
    redeemPoints: 0,
    customerPresentAtRegister: true,
    lifetimeBeforeMinor: 140_000 * KOPECKS_PER_RUBLE,
    lots: [] as BonusLot[],
    now: new Date('2026-08-17T12:00:00.000Z'),
    receiptReference: 'KKT-1001',
    postedReceipts: new Set<string>(),
    idempotencyKey: 'op-1',
    usedIdempotencyKeys: new Set<string>(),
    purchaseLotId: 'lot-1',
    ...overrides,
  }
}

describe('planPurchase', () => {
  it('redeems first, then accrues 10% on the remaining plant amount when the threshold is crossed', () => {
    const result = planPurchase(
      purchaseInput({
        redeemPoints: 5_000,
        lots: [openLot('available', 5_000)],
      }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.redeemedBonusMinor).toBe(5_000 * KOPECKS_PER_RUBLE)
    expect(result.value.netEligiblePlantAmountMinor).toBe(15_000 * KOPECKS_PER_RUBLE)
    expect(result.value.accrual).toEqual(
      expect.objectContaining({
        pointsDelta: 1_500,
        ratePercent: 10,
      }),
    )
    expect(result.value.redemption).toEqual(
      expect.objectContaining({
        pointsDelta: -5_000,
      }),
    )
    expect(result.value.availableBalanceAfterPoints).toBe(0)
    expect(result.value.accrual?.lot.availableAt).toEqual(startOfZonedDay({ year: 2026, month: 8, day: 18 }))
  })

  it('keeps 5% when the check stays below the threshold', () => {
    const result = planPurchase(
      purchaseInput({
        lifetimeBeforeMinor: 100_000 * KOPECKS_PER_RUBLE,
        eligiblePlantAmountMinor: 1_000 * KOPECKS_PER_RUBLE,
      }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.accrual).toEqual(expect.objectContaining({ pointsDelta: 50, ratePercent: 5 }))
  })

  it('rejects a repeated receipt or idempotency key without changing lots', () => {
    expect(planPurchase(purchaseInput({ postedReceipts: new Set(['KKT-1001']) }))).toEqual({
      ok: false,
      code: LoyaltyErrorCode.DUPLICATE_RECEIPT,
    })
    expect(planPurchase(purchaseInput({ usedIdempotencyKeys: new Set(['op-1']) }))).toEqual({
      ok: false,
      code: LoyaltyErrorCode.DUPLICATE_OPERATION,
    })
  })

  it('rejects a remote redemption and an oversized spend', () => {
    expect(planPurchase(purchaseInput({ redeemPoints: 1, customerPresentAtRegister: false }))).toEqual({
      ok: false,
      code: LoyaltyErrorCode.CUSTOMER_NOT_PRESENT,
    })
    expect(
      planPurchase(
        purchaseInput({
          redeemPoints: 10_001,
          lots: [openLot('available', 20_000)],
        }),
      ),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.REDEMPTION_EXCEEDS_LIMIT })
    expect(planPurchase(purchaseInput({ redeemPoints: 10, lots: [] }))).toEqual({
      ok: false,
      code: LoyaltyErrorCode.INSUFFICIENT_BALANCE,
    })
  })
})

describe('planCompensation', () => {
  it('creates a compensating opposite delta with a required reason', () => {
    expect(
      planCompensation({
        originalType: 'accrual',
        originalPointsDelta: 1500,
        alreadyReversed: false,
        reason: 'Возврат растений по чеку KKT-1001',
      }),
    ).toEqual({
      ok: true,
      value: {
        type: 'refund',
        pointsDelta: -1500,
        reason: 'Возврат растений по чеку KKT-1001',
      },
    })
  })

  it('does not reverse an already reversed or unsupported entry', () => {
    expect(
      planCompensation({
        originalType: 'accrual',
        originalPointsDelta: 1500,
        alreadyReversed: true,
        reason: 'Повтор',
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.ALREADY_REVERSED })
    expect(
      planCompensation({
        originalType: 'refund',
        originalPointsDelta: -1500,
        alreadyReversed: false,
        reason: 'Ещё раз',
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.COMPENSATION_NOT_ALLOWED })
    expect(
      planCompensation({
        originalType: 'accrual',
        originalPointsDelta: 1500,
        alreadyReversed: false,
        reason: '   ',
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.INVALID_REASON })
  })
})
