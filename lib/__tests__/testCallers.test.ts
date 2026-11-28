import { describe, expect, it } from 'vitest';
import { extraTestCallers, teamPhoneBook, testCallerName, testCallWords } from '../voice/testCallers';

describe('extraTestCallers', () => {
  it('reads number:name and name:number entries', () => {
    expect(extraTestCallers({ VOICE_TEST_CALLERS: '+18175550101:Chris, Ann:(817) 555-0102' })).toEqual([
      { name: 'Chris', phone: '+18175550101' },
      { name: 'Ann', phone: '+18175550102' },
    ]);
  });

  it('drops an entry with no valid number and names a bare number Team', () => {
    expect(extraTestCallers({ VOICE_TEST_CALLERS: 'Chris:12345, 8175550103, ,' })).toEqual([
      { name: 'Team', phone: '+18175550103' },
    ]);
  });

  it('is empty when the setting is not there', () => {
    expect(extraTestCallers({})).toEqual([]);
  });
});

describe('teamPhoneBook', () => {
  const users = [
    { name: 'Mark King', phone: '+18175550111' },
    { name: 'No Cell', phone: null },
  ];
  const staff = [
    { name: 'Mark', phone: '817-555-0111' },
    { name: 'Blue', phone: '(940) 555-9040' },
  ];

  it('holds every phone once, the first list naming it', () => {
    const book = teamPhoneBook(users, staff, [{ name: 'Chris', phone: '+18175550101' }]);
    expect(Array.from(book)).toEqual([
      ['+18175550111', 'Mark King'],
      ['+19405559040', 'Blue'],
      ['+18175550101', 'Chris'],
    ]);
  });

  it('skips a phone that is not a US number', () => {
    expect(teamPhoneBook([{ name: 'X', phone: '12' }]).size).toBe(0);
  });
});

describe('testCallerName', () => {
  const book = teamPhoneBook([{ name: 'Mark King', phone: '+18175550111' }]);

  it('names the person whatever shape the caller ID arrives in', () => {
    expect(testCallerName('+18175550111', book)).toBe('Mark King');
    expect(testCallerName('(817) 555-0111', book)).toBe('Mark King');
  });

  it('is null for a customer, a withheld number and no number', () => {
    expect(testCallerName('+18175550142', book)).toBeNull();
    expect(testCallerName('anonymous', book)).toBeNull();
    expect(testCallerName(null, book)).toBeNull();
  });
});

describe('testCallWords', () => {
  it('says whose phone and what did not happen', () => {
    expect(testCallWords('Mark King')).toBe(
      "Test call from Mark King's phone. No lead was made and nobody's turn was used.",
    );
  });

  it('still reads once the phone is off the list', () => {
    expect(testCallWords(null)).toBe(
      "Test call from one of our own phones. No lead was made and nobody's turn was used.",
    );
  });
});
