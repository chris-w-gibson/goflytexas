import { describe, expect, it } from 'vitest';
import {
  comingUp,
  dayOffRange,
  dayOffWords,
  isOff,
  leadRecipients,
  moved,
  nextUp,
  offThrough,
  orderForNewcomer,
  pointerAfter,
  whatTheyDid,
  type DayOff,
  type Pointer,
  type RotationPerson,
} from '../rotation';

// Jim 2026-11-22: "a batter's list… it doesn't reset each day. It just goes
// down the list in order and then goes back to the top."
const mark: RotationPerson = { id: 'mark', name: 'Mark', email: 'mark@example.com', order: 1 };
const jim: RotationPerson = { id: 'jim', name: 'Jim', email: 'jim@example.com', order: 2 };
const kristen: RotationPerson = { id: 'kristen', name: 'Kristen', email: 'kristen@example.com', order: 3 };
const team = [kristen, mark, jim];
const nobodyYet: Pointer = { userId: null, position: null };
const today = '2026-11-23';
const off = (userId: string, startDay: string, endDay: string): DayOff => ({
  id: `${userId}-${startDay}`,
  userId,
  startDay,
  endDay,
  note: null,
});

describe('nextUp', () => {
  it('starts at the top of the list', () => {
    expect(nextUp(team, nobodyYet, today, [])).toEqual(mark);
  });

  it('gives two leads in a row to two different people, and returns to the top after the last', () => {
    const handed: string[] = [];
    let pointer = nobodyYet;
    for (let i = 0; i < 5; i++) {
      const person = nextUp(team, pointer, today, [])!;
      handed.push(person.name);
      pointer = pointerAfter(person);
    }
    expect(handed).toEqual(['Mark', 'Jim', 'Kristen', 'Mark', 'Jim']);
  });

  it('carries on from where it left off on a later day', () => {
    expect(nextUp(team, pointerAfter(jim), '2026-12-01', [])).toEqual(kristen);
  });

  it('passes over someone on a day off and comes back to them in their place', () => {
    const jimOff = [off('jim', today, today)];
    expect(nextUp(team, pointerAfter(mark), today, jimOff)).toEqual(kristen);
    expect(nextUp(team, pointerAfter(mark), '2026-11-24', jimOff)).toEqual(jim);
  });

  it('gives nobody the lead when everyone is off or the list is empty', () => {
    const allOff = team.map((p) => off(p.id, today, today));
    expect(nextUp(team, nobodyYet, today, allOff)).toBeNull();
    expect(nextUp([], nobodyYet, today, [])).toBeNull();
  });

  it('carries on from the place of someone who has left the rotation', () => {
    expect(nextUp([mark, kristen], pointerAfter(jim), today, [])).toEqual(kristen);
    expect(nextUp([mark, jim], pointerAfter(kristen), today, [])).toEqual(mark);
  });
});

describe('comingUp', () => {
  it('lists the next people in turn, repeating a short list', () => {
    const names = comingUp([mark, jim], pointerAfter(mark), today, [], 3).map((p) => p.name);
    expect(names).toEqual(['Jim', 'Mark', 'Jim']);
  });
});

describe('days off', () => {
  it('counts the first and the last day of a range', () => {
    const week = [off('jim', '2026-11-26', '2026-11-29')];
    expect(['2026-11-25', '2026-11-26', '2026-11-29', '2026-11-30'].map((d) => isOff('jim', d, week))).toEqual([
      false,
      true,
      true,
      false,
    ]);
    expect(isOff('mark', '2026-11-27', week)).toBe(false);
  });

  it('reads ranges that touch as one stretch', () => {
    const two = [off('jim', '2026-11-23', '2026-11-24'), off('jim', '2026-11-25', '2026-11-27')];
    expect(offThrough('jim', today, two)).toBe('2026-11-27');
    expect(offThrough('jim', '2026-11-28', two)).toBeNull();
  });

  it('takes one day or a range, and refuses an end before the start', () => {
    expect(dayOffRange('2026-11-26', '')).toEqual({ startDay: '2026-11-26', endDay: '2026-11-26' });
    expect(dayOffRange('2026-11-26', '2026-11-29')).toEqual({ startDay: '2026-11-26', endDay: '2026-11-29' });
    expect(dayOffRange('2026-11-26', '2026-11-25')).toBeNull();
    expect(dayOffRange('next week', '')).toBeNull();
  });

  it('prints one day as a day and a range as a range', () => {
    expect(dayOffWords({ startDay: '2026-11-26', endDay: '2026-11-26' })).toBe('Nov 26');
    expect(dayOffWords({ startDay: '2026-11-26', endDay: '2026-11-29' })).toBe('Nov 26 to Nov 29');
  });
});

describe('the order of the list', () => {
  it('swaps a person with the one above', () => {
    expect(moved(team, 'jim', 'up')).toEqual([
      { id: 'jim', order: 1 },
      { id: 'mark', order: 2 },
    ]);
  });

  it('changes nothing at either end', () => {
    expect(moved(team, 'mark', 'up')).toEqual([]);
    expect(moved(team, 'kristen', 'down')).toEqual([]);
  });

  it('puts a newcomer at the end', () => {
    expect(orderForNewcomer(team)).toBe(4);
    expect(orderForNewcomer([])).toBe(1);
  });
});

describe('whatTheyDid', () => {
  const waiting = { status: 'new', firstContactedAt: null, lastNote: null };

  it('says nothing has been done on a lead nobody touched', () => {
    expect(whatTheyDid(waiting)).toEqual({ text: 'Nothing yet', who: null, done: false });
  });

  it('shows the latest note and who wrote it', () => {
    const note = { authorName: 'Mark King', body: 'Made contact by phone\n— coming out on the first' };
    expect(whatTheyDid({ status: 'contacted', firstContactedAt: new Date(0), lastNote: note })).toEqual({
      text: 'Made contact by phone — coming out on the first',
      who: 'Mark King',
      done: true,
    });
  });

  it('says so when a lead was only marked contacted', () => {
    expect(whatTheyDid({ ...waiting, status: 'contacted', firstContactedAt: new Date(0) }).text).toBe(
      'Marked contacted, no note',
    );
  });

  it('leads with Converted on a converted lead', () => {
    expect(whatTheyDid({ ...waiting, status: 'converted' }).text).toBe('Converted');
    const note = { authorName: 'Jim', body: 'Booked a discovery flight' };
    expect(whatTheyDid({ status: 'converted', firstContactedAt: new Date(0), lastNote: note }).text).toBe(
      'Converted. Booked a discovery flight',
    );
  });
});

describe('leadRecipients', () => {
  const inbox = 'info@goflytexas.com';

  it('sends to the person the lead went to and copies nobody', () => {
    expect(leadRecipients(mark, [inbox, 'owner@example.com'])).toEqual({ to: [mark.email] });
  });

  it('sends to the shared inbox alone when nobody took the lead', () => {
    expect(leadRecipients(null, [inbox, 'Info@GoFlyTexas.com'])).toEqual({ to: [inbox] });
  });

  it('sends once when the person the lead went to uses the shared inbox', () => {
    expect(leadRecipients({ email: 'Info@goflytexas.com' }, [inbox])).toEqual({ to: ['Info@goflytexas.com'] });
  });

  it('sends to everyone on the shared list when nobody took the lead', () => {
    expect(leadRecipients(null, [inbox, 'second@example.com'])).toEqual({ to: [inbox, 'second@example.com'] });
  });
});
