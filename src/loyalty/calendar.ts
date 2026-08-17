import { LOYALTY_TIME_ZONE } from './policy'

export const YEKATERINBURG_OFFSET_MS = 5 * 60 * 60 * 1000

export type CalendarDate = {
  readonly year: number
  readonly month: number
  readonly day: number
}

export function assertLoyaltyTimeZone(): typeof LOYALTY_TIME_ZONE {
  return LOYALTY_TIME_ZONE
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function calendarDateFromInstant(instant: Date): CalendarDate {
  const shifted = new Date(instant.getTime() + YEKATERINBURG_OFFSET_MS)

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

export function startOfZonedDay(date: CalendarDate): Date {
  return new Date(Date.UTC(date.year, date.month - 1, date.day) - YEKATERINBURG_OFFSET_MS)
}

export function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days))

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

export function addCalendarYears(date: CalendarDate, years: number): CalendarDate {
  const year = date.year + years
  const day = date.month === 2 && date.day === 29 && !isLeapYear(year) ? 28 : date.day

  return { year, month: date.month, day }
}

export function startOfNextZonedDay(instant: Date): Date {
  return startOfZonedDay(addCalendarDays(calendarDateFromInstant(instant), 1))
}

export function isSameCalendarDate(left: CalendarDate, right: CalendarDate): boolean {
  return left.year === right.year && left.month === right.month && left.day === right.day
}

export function compareCalendarDate(left: CalendarDate, right: CalendarDate): number {
  if (left.year !== right.year) {
    return left.year - right.year
  }

  if (left.month !== right.month) {
    return left.month - right.month
  }

  return left.day - right.day
}
