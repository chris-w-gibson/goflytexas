/**
 * Suggestions and bug reports: what may be sent and where a picture is kept.
 * Pure — shared by the submit route, the page and the form.
 */

export type SuggestionKind = 'suggestion' | 'bug';

export const BODY_MAX = 2000;
export const REPLY_MAX = 1000;
export const MAX_PICTURE_BYTES = 12 * 1024 * 1024;
export const PICTURE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,.heic,.heif';

export const KIND_LABEL: Record<SuggestionKind, string> = { suggestion: 'Suggestion', bug: 'Bug' };

export function parseKind(v: unknown): SuggestionKind | null {
  return v === 'suggestion' || v === 'bug' ? v : null;
}

/** The text as stored, or the words to show when it cannot be taken. */
export function checkBody(v: unknown): { ok: true; body: string } | { ok: false; error: string } {
  const body = typeof v === 'string' ? v.trim() : '';
  if (body.length < 3) return { ok: false, error: 'Write what you want changed, or what went wrong.' };
  if (body.length > BODY_MAX) return { ok: false, error: `That is over ${BODY_MAX} characters. Shorten it a little.` };
  return { ok: true, body };
}

export function cleanReply(v: unknown): string | null {
  const reply = typeof v === 'string' ? v.trim().slice(0, REPLY_MAX) : '';
  return reply || null;
}

const PICTURE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};
const BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
};

export type PictureCheck = { ok: true; mime: string; ext: string } | { ok: false; error: string };

/** Some phones hand over a picture with no type, so the file name is the fallback. */
export function checkPicture(file: { name: string; type?: string | null; size: number }): PictureCheck {
  const given = (file.type ?? '').split(';')[0].trim().toLowerCase();
  const ext = /\.([A-Za-z0-9]{1,5})$/.exec(file.name.trim())?.[1].toLowerCase() ?? '';
  const mime = PICTURE_TYPES[given] ? given : BY_EXT[ext];
  if (!mime) return { ok: false, error: 'The picture has to be a photo or a screenshot.' };
  if (!Number.isFinite(file.size) || file.size <= 0) return { ok: false, error: 'That picture is empty.' };
  if (file.size > MAX_PICTURE_BYTES) return { ok: false, error: 'That picture is over 12 MB. Send a smaller one.' };
  return { ok: true, mime, ext: PICTURE_TYPES[mime] };
}

/** `suggestions/2026/11/<id>.jpg`: the id is ours, never a name from the browser. */
export function pictureKey(id: string, ext: string, now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `suggestions/${y}/${m}/${id}.${ext}`;
}

/** A browser can draw these; a HEIC is offered as a link instead. */
export function drawsInBrowser(mime: string | null | undefined): boolean {
  return mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp' || mime === 'image/gif';
}

export type SuggestionView = 'open' | 'all';

export function parseView(v: string | string[] | undefined): SuggestionView {
  return v === 'all' ? 'all' : 'open';
}
