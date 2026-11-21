/**
 * Media library rules: what may be uploaded, where it is stored, how it is
 * described. Pure — shared by the upload routes, the page and the uploader.
 */

export type MediaKind = 'photo' | 'video';

export const MAX_PHOTO_BYTES = 30 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 750 * 1024 * 1024;
export const NOTE_MAX = 500;

const TYPES: Record<string, { kind: MediaKind; ext: string }> = {
  'image/jpeg': { kind: 'photo', ext: 'jpg' },
  'image/png': { kind: 'photo', ext: 'png' },
  'image/webp': { kind: 'photo', ext: 'webp' },
  'image/gif': { kind: 'photo', ext: 'gif' },
  'image/heic': { kind: 'photo', ext: 'heic' },
  'image/heif': { kind: 'photo', ext: 'heif' },
  'video/mp4': { kind: 'video', ext: 'mp4' },
  'video/quicktime': { kind: 'video', ext: 'mov' },
  'video/webm': { kind: 'video', ext: 'webm' },
};

/** Some phones hand over a file with no type; fall back to the file name. */
const BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
};

export const ACCEPT = 'image/*,video/*,.heic,.heif';

export function extensionOf(filename: string): string {
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(filename.trim());
  return m ? m[1].toLowerCase() : '';
}

/** The type we store, from the browser's type or, failing that, the file name. */
export function mediaType(mime: string | null | undefined, filename: string): string | null {
  const given = (mime ?? '').split(';')[0].trim().toLowerCase();
  if (TYPES[given]) return given;
  return BY_EXT[extensionOf(filename)] ?? null;
}

export function kindOf(mime: string): MediaKind | null {
  return TYPES[mime]?.kind ?? null;
}

export type UploadCheck =
  | { ok: true; kind: MediaKind; mime: string; ext: string }
  | { ok: false; error: string };

/** Whether a file may go in the library, with the words shown when it may not. */
export function checkUpload(file: { name: string; type?: string | null; size: number }): UploadCheck {
  const mime = mediaType(file.type, file.name);
  if (!mime) return { ok: false, error: `${file.name}: only photos and videos go here.` };
  const { kind, ext } = TYPES[mime];
  if (!Number.isFinite(file.size) || file.size <= 0) return { ok: false, error: `${file.name}: the file is empty.` };
  const limit = kind === 'photo' ? MAX_PHOTO_BYTES : MAX_VIDEO_BYTES;
  if (file.size > limit) {
    return { ok: false, error: `${file.name}: ${formatBytes(file.size)} is over the ${formatBytes(limit)} limit for a ${kind}.` };
  }
  return { ok: true, kind, mime, ext };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v);
}

/** `media/2026/11/<id>.jpg` — the id is ours, so a key can be checked before it is signed. */
export function storageKey(id: string, ext: string, now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `media/${y}/${m}/${id}.${ext}`;
}

export function thumbKey(key: string): string {
  return key.replace(/\.[a-z0-9]+$/, '') + '.thumb.jpg';
}

const KEY = /^media\/\d{4}\/\d{2}\/([0-9a-f-]{36})\.(?:thumb\.jpg|[a-z0-9]{1,5})$/;

/** Only a key our own sign route can have issued, for this item. */
export function isKeyFor(id: string, key: unknown): key is string {
  if (typeof key !== 'string') return false;
  const m = KEY.exec(key);
  return !!m && m[1] === id;
}

/** A name safe to hand back in a download header; the original is kept for display. */
export function safeFilename(name: string): string {
  const base = name.replace(/[\\/]/g, ' ').replace(/[^\w.\- ()]/g, '').replace(/\s+/g, ' ').trim();
  return (base || 'file').slice(0, 120);
}

export function cleanNote(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.replace(/\s+/g, ' ').trim().slice(0, NOTE_MAX);
  return t || null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/** "0:42", "12:05" for a video tile. */
export function formatDuration(sec: number | null | undefined): string | null {
  if (sec == null || !Number.isFinite(sec) || sec < 0) return null;
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export type MediaFilter = 'all' | 'photo' | 'video' | 'cleared';

export function parseFilter(v: string | string[] | undefined): MediaFilter {
  const s = Array.isArray(v) ? v[0] : v;
  return s === 'photo' || s === 'video' || s === 'cleared' ? s : 'all';
}
