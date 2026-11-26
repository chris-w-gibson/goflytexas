import { toE164 } from './voice/phone';

/**
 * A person's cell, as an admin types it on the Users page. Blank clears it.
 * One of our own lines is refused: ringing or texting it would loop back in.
 */
export type CellCheck = { ok: true; phone: string | null } | { ok: false; error: string };

export function checkCell(raw: unknown, reserved: ReadonlySet<string>): CellCheck {
  const typed = typeof raw === 'string' ? raw.trim() : '';
  if (!typed) return { ok: true, phone: null };
  const phone = toE164(typed);
  if (!phone) return { ok: false, error: 'That is not a ten-digit US number.' };
  if (reserved.has(phone)) return { ok: false, error: 'That is one of the school\'s own lines. Enter the person\'s cell.' };
  return { ok: true, phone };
}
