import { describe, expect, it } from 'vitest';
import {
  addDays,
  dayLabel,
  hoursWords,
  isDay,
  localDay,
  orderFor,
  orderWords,
  positionsFrom,
  ringPlan,
  upcoming,
  weekStart,
  weekdayOf,
  type Schedule,
} from '../voice/onCall';

const MARK = { id: 'mark', name: 'Mark', phone: '940-555-0101', active: true };
const JIM = { id: 'jim', name: 'Jim', phone: '(214) 555-0102', active: true };
const ANN = { id: 'ann', name: 'Ann', phone: '+18175550103', active: true };

const MONDAY = '2026-11-23';
const TUESDAY = '2026-11-24';

function schedule(over: Partial<Schedule> = {}): Schedule {
  return {
    staff: [MARK, JIM, ANN],
    rota: [
      { weekday: 1, position: 1, staffId: 'mark' },
      { weekday: 1, position: 2, staffId: 'jim' },
      { weekday: 2, position: 1, staffId: 'jim' },
    ],
    overrides: [],
    ...over,
  };
}

describe('localDay', () => {
  it('reads the Central calendar day, not the UTC one', () => {
    // 03:30 UTC on Tuesday is still Monday evening in Texas.
    expect(localDay(new Date('2026-11-24T03:30:00Z'), 'America/Chicago')).toEqual({ day: MONDAY, weekday: 1 });
  });
});

describe('calendar helpers', () => {
  it('weekdayOf counts Sunday as 0', () => {
    expect([weekdayOf('2026-11-22'), weekdayOf(MONDAY), weekdayOf('2026-11-28')]).toEqual([0, 1, 6]);
  });

  it('addDays crosses a month end', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
  });

  it('weekStart is the Monday on or before the day', () => {
    expect([weekStart('2026-11-22'), weekStart(MONDAY), weekStart('2026-11-26')]).toEqual([
      '2026-11-16',
      MONDAY,
      MONDAY,
    ]);
  });

  it('isDay refuses anything that is not a real date', () => {
    expect([isDay(MONDAY), isDay('2026-13-40'), isDay('11/23/2026'), isDay('')]).toEqual([true, false, false, false]);
  });
});

describe('orderFor', () => {
  it('follows the usual week in ring order', () => {
    expect(orderFor(MONDAY, schedule())).toEqual({ day: MONDAY, weekday: 1, changed: false, people: [MARK, JIM] });
  });

  it('a date with its own entry replaces the whole day', () => {
    const s = schedule({ overrides: [{ day: MONDAY, position: 1, staffId: 'ann' }] });
    expect(orderFor(MONDAY, s)).toEqual({ day: MONDAY, weekday: 1, changed: true, people: [ANN] });
    expect(orderFor(TUESDAY, s).people).toEqual([JIM]);
  });

  it('leaves out someone switched off, and moves the next person up', () => {
    const s = schedule({ staff: [{ ...MARK, active: false }, JIM, ANN] });
    expect(orderFor(MONDAY, s).people).toEqual([JIM]);
  });

  it('a day nobody is on has no people', () => {
    expect(orderFor('2026-11-25', schedule()).people).toEqual([]);
  });

  it('never lists the same person twice', () => {
    const s = schedule({
      overrides: [
        { day: MONDAY, position: 1, staffId: 'ann' },
        { day: MONDAY, position: 2, staffId: 'ann' },
      ],
    });
    expect(orderFor(MONDAY, s).people).toEqual([ANN]);
  });
});

describe('upcoming', () => {
  it('lists consecutive days from the start', () => {
    expect(upcoming(MONDAY, 3, schedule()).map((d) => [d.day, d.people.map((p) => p.name)])).toEqual([
      [MONDAY, ['Mark', 'Jim']],
      [TUESDAY, ['Jim']],
      ['2026-11-25', []],
    ]);
  });
});

describe('ringPlan', () => {
  it('turns people into numbers Twilio can dial, in order', () => {
    expect(ringPlan([MARK, JIM], new Set())).toEqual([
      { name: 'Mark', number: '+19405550101' },
      { name: 'Jim', number: '+12145550102' },
    ]);
  });

  it('drops a number that is not dialable, one of our own lines, and a repeat', () => {
    const ours = new Set(['+19405550101']);
    const people = [MARK, { ...JIM, phone: '555' }, ANN, { ...ANN, id: 'ann2', name: 'Ann again' }];
    expect(ringPlan(people, ours)).toEqual([{ name: 'Ann', number: '+18175550103' }]);
  });
});

describe('positionsFrom', () => {
  it('numbers the picks in order and skips blanks and repeats', () => {
    expect(positionsFrom(['', 'jim', 'jim', 'mark'])).toEqual([
      { position: 1, staffId: 'jim' },
      { position: 2, staffId: 'mark' },
    ]);
  });

  it('keeps at most two people', () => {
    expect(positionsFrom(['a', 'b', 'c'])).toEqual([
      { position: 1, staffId: 'a' },
      { position: 2, staffId: 'b' },
    ]);
  });
});

describe('orderWords', () => {
  it('names the order ending with the AI', () => {
    expect([orderWords([MARK, JIM]), orderWords([MARK]), orderWords([])]).toEqual([
      'Mark, then Jim, then the AI',
      'Mark, then the AI',
      'the AI answers',
    ]);
  });
});

describe('hoursWords', () => {
  it('reads the business-hours window as clock times', () => {
    expect([hoursWords('08:00-17:00'), hoursWords('00:00-12:30'), hoursWords('12:00-24:00')]).toEqual([
      '8:00 AM to 5:00 PM',
      '12:00 AM to 12:30 PM',
      '12:00 PM to 12:00 AM',
    ]);
  });

  it('says all day for a window the router cannot read', () => {
    expect(hoursWords('whenever')).toBe('all day');
  });
});

describe('dayLabel', () => {
  it('prints the calendar day whatever the server clock', () => {
    expect([dayLabel(MONDAY), dayLabel(MONDAY, { weekday: false })]).toEqual(['Mon, Nov 23', 'Nov 23']);
  });
});
