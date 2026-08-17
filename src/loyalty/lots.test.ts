import { describe, expect, it } from 'vitest'
import { calendarDateFromInstant, startOfNextZonedDay, startOfZonedDay } from './calendar'
import { allocateRedemption, availableBalancePoints, purchaseLotSchedule, type BonusLot } from './lots'

function lot(overrides: Partial<BonusLot> & Pick<BonusLot, 'id'>): BonusLot {
  return {
    kind: 'purchase',
    issuedPoints: 100,
    consumedPoints: 0,
    availableAt: new Date('2026-08-17T19:00:00.000Z'),
    expiresAt: new Date('2027-08-17T19:00:00.000Z'),
    ...overrides,
  }
}

describe('lots', () => {
  it('activates a purchase lot at the next Yekaterinburg midnight and expires one calendar year later', () => {
    const purchasedAt = new Date('2026-08-17T18:30:00.000Z')
    const schedule = purchaseLotSchedule(purchasedAt)

    expect(schedule.availableAt).toEqual(startOfNextZonedDay(purchasedAt))
    expect(calendarDateFromInstant(schedule.availableAt)).toEqual({ year: 2026, month: 8, day: 18 })
    expect(schedule.expiresAt).toEqual(startOfZonedDay({ year: 2027, month: 8, day: 18 }))
  })

  it('spends available lots with the nearest expiry first', () => {
    const now = new Date('2026-08-18T07:00:00.000Z')
    const lots = [
      lot({ id: 'later', expiresAt: new Date('2027-12-01T19:00:00.000Z'), issuedPoints: 40 }),
      lot({ id: 'soon', expiresAt: new Date('2026-09-01T19:00:00.000Z'), issuedPoints: 30 }),
      lot({
        id: 'pending',
        availableAt: new Date('2026-08-18T19:00:00.000Z'),
        issuedPoints: 80,
      }),
    ]
    const result = allocateRedemption(lots, 50, now)

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.allocations).toEqual([
      { lotId: 'soon', pointsSpent: 30 },
      { lotId: 'later', pointsSpent: 20 },
    ])
    expect(availableBalancePoints(result.value.lots, now)).toBe(20)
  })

  it('ignores pending and expired lots in the available balance', () => {
    const now = new Date('2026-08-18T07:00:00.000Z')
    const lots = [
      lot({ id: 'open', issuedPoints: 15 }),
      lot({ id: 'pending', availableAt: new Date('2026-08-18T19:00:00.000Z'), issuedPoints: 40 }),
      lot({ id: 'expired', expiresAt: new Date('2026-08-18T07:00:00.000Z'), issuedPoints: 25 }),
    ]

    expect(availableBalancePoints(lots, now)).toBe(15)
  })
})
