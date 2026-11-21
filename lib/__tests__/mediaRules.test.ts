import { describe, expect, it } from 'vitest';
import {
  MAX_PHOTO_BYTES,
  checkUpload,
  cleanNote,
  formatBytes,
  formatDuration,
  isKeyFor,
  mediaType,
  parseFilter,
  safeFilename,
  storageKey,
  thumbKey,
} from '../media/rules';

const ID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
const OTHER = '11111111-2222-4333-8444-555555555555';
const NOV = new Date('2026-11-21T15:00:00Z');

describe('mediaType', () => {
  it('takes the browser type when it is one we store', () => {
    expect(mediaType('image/jpeg', 'IMG_0001.JPG')).toBe('image/jpeg');
  });

  it('falls back to the file name when the phone gives no type', () => {
    expect([mediaType('', 'clip.MOV'), mediaType(null, 'photo.heic')]).toEqual(['video/quicktime', 'image/heic']);
  });

  it('refuses a document', () => {
    expect(mediaType('application/pdf', 'rates.pdf')).toBeNull();
  });
});

describe('checkUpload', () => {
  it('accepts a phone photo', () => {
    expect(checkUpload({ name: 'IMG_0001.jpg', type: 'image/jpeg', size: 4_200_000 })).toEqual({
      ok: true,
      kind: 'photo',
      mime: 'image/jpeg',
      ext: 'jpg',
    });
  });

  it('accepts a video', () => {
    expect(checkUpload({ name: 'first-solo.mp4', type: 'video/mp4', size: 90_000_000 })).toEqual({
      ok: true,
      kind: 'video',
      mime: 'video/mp4',
      ext: 'mp4',
    });
  });

  it('says why a photo over the limit is refused', () => {
    expect(checkUpload({ name: 'huge.png', type: 'image/png', size: MAX_PHOTO_BYTES + 1 })).toEqual({
      ok: false,
      error: 'huge.png: 30 MB is over the 30 MB limit for a photo.',
    });
  });

  it('refuses an empty file and a file that is not media', () => {
    expect([
      checkUpload({ name: 'a.jpg', type: 'image/jpeg', size: 0 }),
      checkUpload({ name: 'notes.txt', type: 'text/plain', size: 10 }),
    ]).toEqual([
      { ok: false, error: 'a.jpg: the file is empty.' },
      { ok: false, error: 'notes.txt: only photos and videos go here.' },
    ]);
  });
});

describe('storage keys', () => {
  it('files an item under its month with its own id', () => {
    expect(storageKey(ID, 'jpg', NOV)).toBe(`media/2026/11/${ID}.jpg`);
  });

  it('puts the thumbnail beside the file', () => {
    expect(thumbKey(`media/2026/11/${ID}.mov`)).toBe(`media/2026/11/${ID}.thumb.jpg`);
  });

  it('isKeyFor accepts only the keys issued for that item', () => {
    expect([
      isKeyFor(ID, `media/2026/11/${ID}.jpg`),
      isKeyFor(ID, `media/2026/11/${ID}.thumb.jpg`),
      isKeyFor(ID, `media/2026/11/${OTHER}.jpg`),
      isKeyFor(ID, `backups/db.sql`),
      isKeyFor(ID, `media/2026/11/../${ID}.jpg`),
      isKeyFor(ID, null),
    ]).toEqual([true, true, false, false, false, false]);
  });
});

describe('safeFilename', () => {
  it('keeps a plain name and strips path and header characters', () => {
    expect([safeFilename('First solo (Sam).mp4'), safeFilename('../../etc/"x"\r\n.jpg'), safeFilename('///')]).toEqual([
      'First solo (Sam).mp4',
      '.. .. etc x.jpg',
      'file',
    ]);
  });
});

describe('cleanNote', () => {
  it('trims, collapses spaces and treats blank as no note', () => {
    expect([cleanNote('  Sam,  first solo \n in N123  '), cleanNote('   '), cleanNote(42)]).toEqual([
      'Sam, first solo in N123',
      null,
      null,
    ]);
  });
});

describe('formatting', () => {
  it('formatBytes reads sizes the way a person would', () => {
    expect([formatBytes(900), formatBytes(4_200_000), formatBytes(90_000_000), formatBytes(1_500_000_000)]).toEqual([
      '900 B',
      '4.0 MB',
      '86 MB',
      '1.4 GB',
    ]);
  });

  it('formatDuration prints minutes and seconds', () => {
    expect([formatDuration(42), formatDuration(725), formatDuration(null)]).toEqual(['0:42', '12:05', null]);
  });
});

describe('parseFilter', () => {
  it('reads the three filters and falls back to all', () => {
    expect([parseFilter('photo'), parseFilter('video'), parseFilter('cleared'), parseFilter('x'), parseFilter(undefined)]).toEqual([
      'photo',
      'video',
      'cleared',
      'all',
      'all',
    ]);
  });
});
