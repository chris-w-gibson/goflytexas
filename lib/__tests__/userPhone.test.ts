import { describe, expect, it } from 'vitest';
import { checkCell } from '../userPhone';

const OURS = new Set(['+19409053090']);

describe('checkCell', () => {
  it('stores any common way of typing a US number the same way', () => {
    expect([checkCell('(817) 555-0142', OURS), checkCell('817.555.0142', OURS), checkCell('1 817 555 0142', OURS)]).toEqual([
      { ok: true, phone: '+18175550142' },
      { ok: true, phone: '+18175550142' },
      { ok: true, phone: '+18175550142' },
    ]);
  });

  it('clears on blank, and refuses a short number or one of our own lines', () => {
    expect([checkCell('  ', OURS), checkCell(null, OURS), checkCell('555-0142', OURS), checkCell('940-905-3090', OURS)]).toEqual([
      { ok: true, phone: null },
      { ok: true, phone: null },
      { ok: false, error: 'That is not a ten-digit US number.' },
      { ok: false, error: "That is one of the school's own lines. Enter the person's cell." },
    ]);
  });
});
