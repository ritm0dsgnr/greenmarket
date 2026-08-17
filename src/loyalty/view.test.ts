import { describe, expect, it } from 'vitest'
import { startOfZonedDay } from './calendar'
import type { BonusLot } from './lots'
import { KOPECKS_PER_RUBLE } from './policy'
import { LoyaltyErrorCode } from './result'
import { assertOwnTelegramContact } from './telegram-contact'
import { parseBonusProgramUrl, projectTelegramCustomerView } from './view'

describe('telegram contact and customer view', () => {
  it('accepts a contact only when it belongs to the sender', () => {
    expect(assertOwnTelegramContact(1001n, 1001n)).toEqual({ ok: true, value: 1001n })
    expect(assertOwnTelegramContact(1001n, 1002n)).toEqual({
      ok: false,
      code: LoyaltyErrorCode.TELEGRAM_CONTACT_MISMATCH,
    })
    expect(assertOwnTelegramContact(1001n, undefined)).toEqual({
      ok: false,
      code: LoyaltyErrorCode.TELEGRAM_CONTACT_MISMATCH,
    })
  })

  it('builds a cabinet view from the linked customer lots only', () => {
    const now = new Date('2026-08-18T07:00:00.000Z')
    const lots: BonusLot[] = [
      {
        id: 'open-soon',
        kind: 'purchase',
        issuedPoints: 40,
        consumedPoints: 10,
        availableAt: startOfZonedDay({ year: 2026, month: 8, day: 18 }),
        expiresAt: startOfZonedDay({ year: 2026, month: 9, day: 1 }),
      },
      {
        id: 'tomorrow',
        kind: 'purchase',
        issuedPoints: 80,
        consumedPoints: 0,
        availableAt: startOfZonedDay({ year: 2026, month: 8, day: 19 }),
        expiresAt: startOfZonedDay({ year: 2027, month: 8, day: 19 }),
      },
    ]
    const result = projectTelegramCustomerView({
      lots,
      lifetimeNetEligiblePlantAmountMinor: 140_000 * KOPECKS_PER_RUBLE,
      history: [
        {
          occurredAt: now,
          type: 'accrual',
          pointsDelta: 80,
          plantAmountMinor: 1_600 * KOPECKS_PER_RUBLE,
          availableBalanceAfterPoints: 30,
        },
      ],
      now,
      termsUrl: 'https://example.invalid/bonus-program',
    })

    expect(result).toEqual({
      ok: true,
      value: {
        availablePoints: 30,
        activatingTomorrowPoints: 80,
        accrualRatePercent: 5,
        remainingToThresholdMinor: 10_000 * KOPECKS_PER_RUBLE,
        history: [
          {
            occurredAt: now,
            type: 'accrual',
            pointsDelta: 80,
            plantAmountMinor: 1_600 * KOPECKS_PER_RUBLE,
            availableBalanceAfterPoints: 30,
          },
        ],
        expiringLots: [
          {
            points: 30,
            expiresAt: startOfZonedDay({ year: 2026, month: 9, day: 1 }),
          },
        ],
        termsUrl: 'https://example.invalid/bonus-program',
      },
    })
  })

  it('takes the bonus-program URL from server configuration', () => {
    expect(parseBonusProgramUrl('https://greenmarket.example/bonus-program')).toEqual({
      ok: true,
      value: 'https://greenmarket.example/bonus-program',
    })
    expect(parseBonusProgramUrl('http://greenmarket.example/bonus-program').ok).toBe(false)
    expect(parseBonusProgramUrl('https://greenmarket.example/bonus-program?ref=1').ok).toBe(false)
  })
})
