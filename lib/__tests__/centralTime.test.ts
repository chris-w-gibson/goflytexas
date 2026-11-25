import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { centralDate, centralDateTime, centralDay, centralShort } from '../centralTime';

// A lead that came in Tuesday 11/24 at 6:22 PM Central: already Wednesday in UTC.
const EVENING = new Date('2026-11-25T00:22:15Z');
// Summer, when Central is five hours behind: 7:30 PM on 7/1.
const SUMMER_EVENING = new Date('2026-07-02T00:30:00Z');

describe('central time', () => {
  it('prints the Central day for an evening in winter and in summer', () => {
    expect([centralDate(EVENING), centralDate(SUMMER_EVENING)]).toEqual(['11/24/2026', '7/1/2026']);
  });

  it('prints the Central time of day', () => {
    expect([centralDateTime(EVENING), centralDateTime(SUMMER_EVENING)]).toEqual([
      '11/24/2026, 6:22 PM',
      '7/1/2026, 7:30 PM',
    ]);
  });

  it('prints the short and the day forms in Central', () => {
    expect([centralShort(EVENING), centralDay(EVENING)]).toEqual(['Nov 24, 6:22 PM', 'Nov 24, 2026']);
  });

  it('takes the ISO text a page may hold instead of a Date', () => {
    expect(centralDate(EVENING.toISOString())).toBe('11/24/2026');
  });
});

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return pages(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

/** The text of a call from its name to its closing parenthesis. */
function callText(source: string, start: number): string {
  let depth = 0;
  for (let i = source.indexOf('(', start); i < source.length; i++) {
    if (source[i] === '(') depth++;
    if (source[i] === ')' && --depth === 0) return source.slice(start, i + 1);
  }
  return source.slice(start);
}

describe('admin pages', () => {
  it('never format a date without naming the zone', () => {
    const unzoned = pages(join(__dirname, '..', '..', 'app', 'admin')).flatMap((path) => {
      const source = readFileSync(path, 'utf8');
      return Array.from(source.matchAll(/\.toLocale(?:Date|Time)?String\(/g))
        .map((m) => callText(source, m.index))
        .filter((call) => !call.includes('timeZone'))
        .map((call) => `${path.split('/app/')[1]}: ${call.replace(/\s+/g, ' ')}`);
    });
    expect(unzoned).toEqual([]);
  });
});
