import { describe, expect, it } from 'vitest';
import {
  isArchived,
  leadListHref,
  parseLeadListParams,
  subscriptionLabel,
} from '../leadFilters';

// Jim 2026-09-24 (GFT Hub): name search, archive, and subscription kept
// apart from the pipeline status.
describe('parseLeadListParams', () => {
  it('defaults to the active list with no filters', () => {
    expect(parseLeadListParams(undefined)).toEqual({ view: 'active' });
    expect(parseLeadListParams({})).toEqual({ view: 'active' });
  });

  it('reads a pipeline status, a search, and the archived view', () => {
    expect(parseLeadListParams({ status: 'contacted', q: '  Jack ', view: 'archived' })).toEqual({
      status: 'contacted',
      q: 'Jack',
      view: 'archived',
    });
  });

  it('treats the old ?status=unsubscribed link as the subscription filter', () => {
    expect(parseLeadListParams({ status: 'unsubscribed' })).toEqual({
      view: 'active',
      subscribed: false,
    });
  });

  it('reads subscribed=yes|no and ignores junk', () => {
    expect(parseLeadListParams({ subscribed: 'no' }).subscribed).toBe(false);
    expect(parseLeadListParams({ subscribed: 'yes' }).subscribed).toBe(true);
    expect(parseLeadListParams({ subscribed: 'maybe', status: 'bogus', view: 'x' })).toEqual({
      view: 'active',
    });
  });

  it('caps the search text', () => {
    expect(parseLeadListParams({ q: 'a'.repeat(200) }).q).toHaveLength(80);
  });
});

describe('leadListHref', () => {
  it('round-trips the filters', () => {
    const params = parseLeadListParams({ status: 'new', q: 'jack corn', subscribed: 'no' });
    expect(leadListHref(params)).toBe('/admin/leads?status=new&q=jack+corn&subscribed=no');
    expect(parseLeadListParams(Object.fromEntries(new URL('https://x' + leadListHref(params)).searchParams))).toEqual(params);
  });

  it('is the bare list with nothing set', () => {
    expect(leadListHref({ view: 'active' })).toBe('/admin/leads');
    expect(leadListHref({ view: 'archived' })).toBe('/admin/leads?view=archived');
  });
});

describe('labels', () => {
  it('reads subscription off the boolean, never the status', () => {
    expect(subscriptionLabel({ unsubscribed: false })).toBe('Subscribed');
    expect(subscriptionLabel({ unsubscribed: true })).toBe('Unsubscribed');
  });

  it('knows an archived lead by its timestamp', () => {
    expect(isArchived({ archivedAt: null })).toBe(false);
    expect(isArchived({ archivedAt: new Date() })).toBe(true);
  });
});
