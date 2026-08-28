/** Phone-number helpers for the voice agent. Pure; US numbers only. */

const ANONYMOUS = /^(anonymous|restricted|private|unknown|blocked|unavailable|withheld)$/i;

/** `+19409053090` from any common US formatting, else null. */
export function toE164(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || ANONYMOUS.test(s)) return null;
  const digits = s.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return null;
}

export function isAnonymousCaller(raw: string | null | undefined): boolean {
  return toE164(raw) === null;
}

/** `940-905-3090` — the same shape the web forms store, so existing tel: links work. */
export function formatPhoneDisplay(raw: string | null | undefined): string | null {
  const e = toE164(raw);
  if (!e) return null;
  const d = e.slice(2);
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
}

export function lastFour(raw: string | null | undefined): string | null {
  const e = toE164(raw);
  return e ? e.slice(-4) : null;
}

/** Digits spaced for text-to-speech: "9 4 0, 9 0 5, 3 0 9 0". */
export function formatSpoken(raw: string | null | undefined): string | null {
  const e = toE164(raw);
  if (!e) return null;
  const d = e.slice(2);
  const group = (s: string) => s.split('').join(' ');
  return `${group(d.slice(0, 3))}, ${group(d.slice(3, 6))}, ${group(d.slice(6))}`;
}
