// Outcome options for the "I've reached out" ack page (Jim 2026-08-31).
// Multi-select — one touch can legitimately be several of these.

export const OUTCOME_OPTIONS = [
  { id: 'phone', label: 'Made contact by phone' },
  { id: 'voicemail', label: 'Called and left a voicemail' },
  { id: 'email', label: 'Sent an email' },
  { id: 'text', label: 'Sent a text' },
  { id: 'walkin', label: 'Walk-in — met with them' },
] as const;

export type OutcomeId = (typeof OUTCOME_OPTIONS)[number]['id'];

const LABELS = new Map<string, string>(OUTCOME_OPTIONS.map((o) => [o.id, o.label]));

/**
 * One lead-sheet note line from the ack form: selected outcomes joined,
 * free-text note appended. Unknown ids are dropped (stale form / tampering).
 */
export function composeOutcomeNote(outcomes: string[], note: string): string {
  const labels = outcomes.map((o) => LABELS.get(o)).filter((l): l is string => !!l);
  const trimmed = note.trim();
  if (!labels.length && !trimmed) return 'Marked as reached out.';
  const parts: string[] = [];
  if (labels.length) parts.push(labels.join(' · '));
  if (trimmed) parts.push(trimmed);
  return parts.join(' — ');
}
