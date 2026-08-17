import {
  addCalendarDays,
  calendarDateFromInstant,
  isLeapYear,
  isSameCalendarDate,
  startOfZonedDay,
  type CalendarDate,
} from './calendar'
import {
  BIRTHDAY_GRANT_DAYS_BEFORE,
  BIRTHDAY_GRANT_POINTS,
  BIRTHDAY_VALID_DAYS,
} from './policy'
import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

const DAYS_IN_MONTH = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const

export type BirthDate = {
  readonly month: number
  readonly day: number
}

export type BirthdayGrant = {
  readonly points: number
  readonly celebratedYear: number
  readonly availableAt: Date
  readonly expiresAt: Date
}

export function parseBirthDate(month: number, day: number): LoyaltyResult<BirthDate> {
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12) {
    return fail(LoyaltyErrorCode.INVALID_BIRTH_DATE)
  }

  const maxDay = DAYS_IN_MONTH[month]

  if (maxDay === undefined || day < 1 || day > maxDay) {
    return fail(LoyaltyErrorCode.INVALID_BIRTH_DATE)
  }

  return ok({ month, day })
}

export function observedBirthday(birth: BirthDate, year: number): CalendarDate {
  const day = birth.month === 2 && birth.day === 29 && !isLeapYear(year) ? 28 : birth.day

  return { year, month: birth.month, day }
}

export function birthdayGrantDate(birth: BirthDate, celebratedYear: number): CalendarDate {
  return addCalendarDays(observedBirthday(birth, celebratedYear), -BIRTHDAY_GRANT_DAYS_BEFORE)
}

export function planBirthdayGrant(input: {
  readonly birth: BirthDate
  readonly now: Date
  readonly registeredAt: Date
  readonly grantedCelebratedYears: ReadonlySet<number>
}): LoyaltyResult<BirthdayGrant> {
  const today = calendarDateFromInstant(input.now)
  const candidates = [today.year, today.year + 1]

  for (const celebratedYear of candidates) {
    const grantDate = birthdayGrantDate(input.birth, celebratedYear)

    if (!isSameCalendarDate(grantDate, today)) {
      continue
    }

    if (input.grantedCelebratedYears.has(celebratedYear)) {
      return fail(LoyaltyErrorCode.BIRTHDAY_ALREADY_GRANTED)
    }

    const availableAt = startOfZonedDay(grantDate)

    if (input.registeredAt.getTime() > availableAt.getTime()) {
      return fail(LoyaltyErrorCode.BIRTHDAY_REGISTERED_AFTER_GRANT)
    }

    return ok({
      points: BIRTHDAY_GRANT_POINTS,
      celebratedYear,
      availableAt,
      expiresAt: startOfZonedDay(addCalendarDays(grantDate, BIRTHDAY_VALID_DAYS)),
    })
  }

  return fail(LoyaltyErrorCode.BIRTHDAY_NOT_DUE)
}
