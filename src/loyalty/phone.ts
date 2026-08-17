import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

const DIGITS_ONLY = /^\d+$/

export type NormalizedPhone = `+7${string}`

export function normalizePhone(input: string): LoyaltyResult<NormalizedPhone> {
  const digits = input.replace(/[()\s.-]/g, '')

  if (digits.startsWith('+')) {
    return toRussianE164(digits.slice(1))
  }

  return toRussianE164(digits)
}

function toRussianE164(rawDigits: string): LoyaltyResult<NormalizedPhone> {
  if (!DIGITS_ONLY.test(rawDigits)) {
    return fail(LoyaltyErrorCode.INVALID_PHONE)
  }

  let national = rawDigits

  if (national.length === 11 && (national.startsWith('7') || national.startsWith('8'))) {
    national = national.slice(1)
  }

  if (national.length !== 10 || national.startsWith('0')) {
    return fail(LoyaltyErrorCode.INVALID_PHONE)
  }

  return ok(`+7${national}` as NormalizedPhone)
}
