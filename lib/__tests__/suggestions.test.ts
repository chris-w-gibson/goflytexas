import { describe, expect, it } from 'vitest';
import {
  BODY_MAX,
  checkBody,
  checkPicture,
  cleanReply,
  drawsInBrowser,
  MAX_PICTURE_BYTES,
  parseKind,
  parseView,
  pictureKey,
} from '../suggestions/rules';
import { suggestionRecipients } from '../email';

const MB = 1024 * 1024;

describe('checkBody', () => {
  it('keeps the text trimmed and refuses nothing or too much', () => {
    expect([checkBody('  The dates are a day off  '), checkBody(' x '), checkBody(null), checkBody('a'.repeat(BODY_MAX + 1))]).toEqual([
      { ok: true, body: 'The dates are a day off' },
      { ok: false, error: 'Write what you want changed, or what went wrong.' },
      { ok: false, error: 'Write what you want changed, or what went wrong.' },
      { ok: false, error: `That is over ${BODY_MAX} characters. Shorten it a little.` },
    ]);
  });
});

describe('checkPicture', () => {
  it('takes a photo or a screenshot, by type or by file name', () => {
    expect([
      checkPicture({ name: 'IMG_1.JPG', type: 'image/jpeg', size: 3 * MB }),
      checkPicture({ name: 'Screenshot.png', type: '', size: MB }),
      checkPicture({ name: 'IMG_2.HEIC', type: null, size: 2 * MB }),
    ]).toEqual([
      { ok: true, mime: 'image/jpeg', ext: 'jpg' },
      { ok: true, mime: 'image/png', ext: 'png' },
      { ok: true, mime: 'image/heic', ext: 'heic' },
    ]);
  });

  it('refuses another kind of file, an empty one and one over the limit', () => {
    expect([
      checkPicture({ name: 'notes.pdf', type: 'application/pdf', size: MB }),
      checkPicture({ name: 'clip.mov', type: 'video/quicktime', size: MB }),
      checkPicture({ name: 'a.png', type: 'image/png', size: 0 }),
      checkPicture({ name: 'a.png', type: 'image/png', size: MAX_PICTURE_BYTES + 1 }),
    ]).toEqual([
      { ok: false, error: 'The picture has to be a photo or a screenshot.' },
      { ok: false, error: 'The picture has to be a photo or a screenshot.' },
      { ok: false, error: 'That picture is empty.' },
      { ok: false, error: 'That picture is over 12 MB. Send a smaller one.' },
    ]);
  });
});

describe('the small rules', () => {
  it('names a picture by our id and the month, never by the file name', () => {
    expect(pictureKey('0b6f7c1e-0000-4000-8000-000000000001', 'jpg', new Date('2026-11-26T03:00:00Z'))).toBe(
      'suggestions/2026/11/0b6f7c1e-0000-4000-8000-000000000001.jpg',
    );
  });

  it('reads the kind, the view and the reply', () => {
    expect([parseKind('bug'), parseKind('suggestion'), parseKind('other'), parseView('all'), parseView(undefined)]).toEqual([
      'bug',
      'suggestion',
      null,
      'all',
      'open',
    ]);
    expect([cleanReply('  Fixed 11/26.  '), cleanReply('   '), cleanReply(undefined)]).toEqual(['Fixed 11/26.', null, null]);
  });

  it('draws what a browser can and links a HEIC', () => {
    expect([drawsInBrowser('image/png'), drawsInBrowser('image/heic'), drawsInBrowser(null)]).toEqual([true, false, false]);
  });

  it('mails nobody until addresses are set', () => {
    expect([suggestionRecipients({}), suggestionRecipients({ SUGGESTION_NOTIFY_EMAILS: 'a@x.co, b@x.co' })]).toEqual([
      [],
      ['a@x.co', 'b@x.co'],
    ]);
  });
});
