import { describe, expect, it } from 'vitest'
import { birthdayGrantDate, observedBirthday, parseBirthDate, planBirthdayGrant } from './birthday'
import { startOfZonedDay } from './calendar'
import { LoyaltyErrorCode } from './result'

describe('birthday', () => {
  it('accepts day and month only, including 29 February', () => {
    expect(parseBirthDate(2, 29)).toEqual({ ok: true, value: { month: 2, day: 29 } })
    expect(parseBirthDate(4, 31).ok).toBe(false)
    expect(parseBirthDate(0, 10).ok).toBe(false)
  })

  it('observes 29 February as 28 February in a non-leap year', () => {
    expect(observedBirthday({ month: 2, day: 29 }, 2026)).toEqual({ year: 2026, month: 2, day: 28 })
    expect(observedBirthday({ month: 2, day: 29 }, 2024)).toEqual({ year: 2024, month: 2, day: 29 })
  })

  it('grants 500 points seven days before the observed birthday for 14 days', () => {
    const now = startOfZonedDay({ year: 2026, month: 3, day: 8 })
    const result = planBirthdayGrant({
      birth: { month: 3, day: 15 },
      now,
      registeredAt: startOfZonedDay({ year: 2025, month: 6, day: 1 }),
      grantedCelebratedYears: new Set(),
    })

    expect(result).toEqual({
      ok: true,
      value: {
        points: 500,
        celebratedYear: 2026,
        availableAt: startOfZonedDay({ year: 2026, month: 3, day: 8 }),
        expiresAt: startOfZonedDay({ year: 2026, month: 3, day: 22 }),
      },
    })
    expect(birthdayGrantDate({ month: 1, day: 3 }, 2027)).toEqual({ year: 2026, month: 12, day: 27 })
  })

  it('does not grant twice in the same celebrated year or after late registration', () => {
    const now = startOfZonedDay({ year: 2026, month: 3, day: 8 })

    expect(
      planBirthdayGrant({
        birth: { month: 3, day: 15 },
        now,
        registeredAt: startOfZonedDay({ year: 2025, month: 6, day: 1 }),
        grantedCelebratedYears: new Set([2026]),
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.BIRTHDAY_ALREADY_GRANTED })

    expect(
      planBirthdayGrant({
        birth: { month: 3, day: 15 },
        now,
        registeredAt: new Date(now.getTime() + 1),
        grantedCelebratedYears: new Set(),
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.BIRTHDAY_REGISTERED_AFTER_GRANT })
  })

  it('does not grant on a day outside the birthday window', () => {
    expect(
      planBirthdayGrant({
        birth: { month: 3, day: 15 },
        now: startOfZonedDay({ year: 2026, month: 3, day: 9 }),
        registeredAt: startOfZonedDay({ year: 2025, month: 6, day: 1 }),
        grantedCelebratedYears: new Set(),
      }),
    ).toEqual({ ok: false, code: LoyaltyErrorCode.BIRTHDAY_NOT_DUE })
  })
})
