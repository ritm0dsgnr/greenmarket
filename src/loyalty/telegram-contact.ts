import { fail, ok, type LoyaltyResult } from './result'
import { LoyaltyErrorCode } from './result'

export function assertOwnTelegramContact(
  senderUserId: bigint,
  contactUserId: bigint | undefined,
): LoyaltyResult<bigint> {
  if (contactUserId === undefined || contactUserId !== senderUserId) {
    return fail(LoyaltyErrorCode.TELEGRAM_CONTACT_MISMATCH)
  }

  return ok(contactUserId)
}
