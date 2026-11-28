import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Call, Lead } from '@/lib/db/schema';

vi.mock('@/lib/calls', () => ({
  claimTranscription: vi.fn(),
  countPipelineCallsSince: vi.fn(async () => 0),
  finalizeCall: vi.fn(async () => undefined),
  getCallById: vi.fn(),
  getCallByPlatformId: vi.fn(),
  linkChildCall: vi.fn(async () => null),
  upsertCallEnded: vi.fn(),
  upsertTwilioCall: vi.fn(),
}));
vi.mock('@/lib/leads', () => ({
  addLeadNote: vi.fn(async () => undefined),
  createLead: vi.fn(),
  findRecentLeadByPhone: vi.fn(async () => undefined),
  markContactedAt: vi.fn(async () => undefined),
  recordEmailEvent: vi.fn(async () => undefined),
}));
vi.mock('@/lib/email', () => ({ sendAdminNotification: vi.fn(async () => undefined) }));
vi.mock('@/lib/rotationStore', () => ({
  giveLeadToSafely: vi.fn(async () => null),
  handOutLeadSafely: vi.fn(async () => null),
  ownerOf: vi.fn(async () => null),
}));
vi.mock('../voice/extract', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../voice/extract')>();
  return { ...actual, extractCall: vi.fn() };
});
vi.mock('../voice/testCallerStore', () => ({ testCallerFor: vi.fn(async () => null) }));
vi.mock('../voice/transcribe', () => ({
  transcribeRecording: vi.fn(async () => ({ turns: [{ role: 'user', text: 'transcribed words here' }], raw: {}, channels: 2 })),
  twilioTranscribeOpts: vi.fn(() => ({ accountSid: 'a', authToken: 'b', deepgramKey: 'c' })),
}));

import * as calls from '@/lib/calls';
import * as leads from '@/lib/leads';
import { sendAdminNotification } from '@/lib/email';
import { giveLeadToSafely, handOutLeadSafely, ownerOf } from '@/lib/rotationStore';
import { extractCall } from '../voice/extract';
import { testCallerFor } from '../voice/testCallerStore';
import { transcribeRecording } from '../voice/transcribe';
import { processCallEnd, processRawPayload, processTwilioCall } from '../voice/pipeline';

const startedAt = new Date('2026-08-29T15:00:00Z');
const endedAt = new Date('2026-08-29T15:04:00Z');

function row(over: Partial<Call> = {}): Call {
  return {
    id: 'call-uuid',
    platform: 'twilio',
    platformCallId: 'CA123',
    leadId: null,
    fromNumber: '+18175550142',
    toNumber: '+19402423072',
    forwardedFrom: null,
    startedAt,
    endedAt,
    durationSec: 240,
    status: 'answered',
    endedReason: 'dial:completed',
    recordingUrl: 'https://api.twilio.com/rec/RE1',
    transcript: [
      { role: 'assistant', text: 'GoFlyTexas, this is Jim.' },
      { role: 'user', text: 'Hi, I want a discovery flight Tuesday.' },
    ],
    summary: null,
    extracted: null,
    rawPayload: null,
    answeredBy: 'human',
    answeredByName: 'Jim',
    parentCallId: null,
    recordingSid: 'RE1',
    dialCallSid: 'CA456',
    transcriptionStatus: null,
    forwardedToAiAt: null,
    createdAt: startedAt,
    updatedAt: endedAt,
    ...over,
  } as Call;
}

const lead = { id: 'lead-1', createdAt: startedAt, contactToken: 'tok' } as unknown as Lead;
const extraction = {
  summary: 'Sarah wants a discovery flight Tuesday.',
  callerName: 'Sarah Mitchell',
  callbackPhone: null,
  interest: 'discovery',
  preferredTime: 'Tuesday',
  spam: false,
  spamReason: null,
  followUps: ['Jim to confirm Tuesday 3pm'],
  booking: 'Discovery flight, Tuesday 3pm',
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANTHROPIC_API_KEY = 'test';
  vi.mocked(leads.findRecentLeadByPhone).mockResolvedValue(undefined);
  vi.mocked(testCallerFor).mockResolvedValue(null);
  vi.mocked(calls.countPipelineCallsSince).mockResolvedValue(0);
  vi.mocked(calls.linkChildCall).mockResolvedValue(null);
  vi.mocked(extractCall).mockResolvedValue(extraction as never);
  vi.mocked(leads.createLead).mockResolvedValue(lead);
  vi.mocked(calls.getCallById).mockImplementation(async () => row({ status: 'processed', leadId: 'lead-1' }));
});

describe('processTwilioCall — human-answered', () => {
  it('extracts in human mode, files the lead as a live-answered human touch, emails the notes variant', async () => {
    const r = row();
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(r);
    vi.mocked(calls.claimTranscription).mockResolvedValue(r);

    const result = await processTwilioCall('CA123');
    expect('call' in result).toBe(true);
    expect(transcribeRecording).not.toHaveBeenCalled(); // transcript already on the row
    expect(vi.mocked(extractCall).mock.calls[0][4]).toEqual({ kind: 'human', staffName: 'Jim' });
    const created = vi.mocked(leads.createLead).mock.calls[0][0];
    expect(created.source).toBe('phone');
    expect(created.createdAt).toEqual(startedAt);
    expect(created.attribution).toEqual({ utm_source: 'phone', utm_campaign: 'answered-call' });
    expect(created.message).toContain('Booked: Discovery flight, Tuesday 3pm');
    expect(leads.markContactedAt).toHaveBeenCalledWith('lead-1', endedAt);
    const email = vi.mocked(sendAdminNotification).mock.calls[0][1]!.call!;
    expect(email.answeredBy).toBe('human');
    expect(email.answeredByName).toBe('Jim');
    expect(email.followUps).toEqual(['Jim to confirm Tuesday 3pm']);
    expect(email.recordingUrl).toMatch(/\/admin\/calls\/recording\/RE1$/);
    expect(calls.finalizeCall).toHaveBeenCalledWith(
      'call-uuid',
      expect.objectContaining({ status: 'processed', leadId: 'lead-1', transcriptionStatus: 'done' }),
    );
  });

  it('repeat caller within 24h → note by "Jim (phone)", still stamped, no twin lead', async () => {
    const r = row();
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(r);
    vi.mocked(calls.claimTranscription).mockResolvedValue(r);
    vi.mocked(leads.findRecentLeadByPhone).mockResolvedValue({ ...lead, createdAt: new Date(startedAt.getTime() - 3600_000) } as Lead);

    await processTwilioCall('CA123');
    expect(leads.createLead).not.toHaveBeenCalled();
    expect(vi.mocked(leads.addLeadNote).mock.calls[0][0].authorName).toBe('Jim (phone)');
    expect(leads.markContactedAt).toHaveBeenCalled();
  });

  it('transcribes when the row has no transcript yet, and when forced', async () => {
    const bare = row({ transcript: null });
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(bare);
    vi.mocked(calls.claimTranscription).mockResolvedValue(bare);
    vi.mocked(calls.upsertTwilioCall).mockResolvedValue(row());
    await processTwilioCall('CA123');
    expect(transcribeRecording).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();
    vi.mocked(extractCall).mockResolvedValue(extraction as never);
    vi.mocked(leads.createLead).mockResolvedValue(lead);
    const done = row({ status: 'processed', leadId: 'lead-1' });
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(done);
    vi.mocked(calls.claimTranscription).mockResolvedValue(done);
    vi.mocked(calls.upsertTwilioCall).mockResolvedValue(done);
    vi.mocked(calls.getCallById).mockResolvedValue(done);
    await processTwilioCall('CA123', { force: true });
    expect(transcribeRecording).toHaveBeenCalledTimes(1);
    expect(calls.upsertTwilioCall).toHaveBeenCalledWith(expect.objectContaining({ transcriptionStatus: 'pending' }));
  });

  it('skips forwarded-to-AI parents, terminal rows and rows without a recording', async () => {
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(row({ answeredBy: 'ai', status: 'forwarded_to_ai' }));
    expect(await processTwilioCall('CA123')).toEqual({ skipped: 'not human-answered' });

    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(row({ status: 'processed', leadId: 'lead-1' }));
    expect(await processTwilioCall('CA123')).toEqual({ skipped: 'already processed' });

    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(row({ recordingUrl: null }));
    expect(await processTwilioCall('CA123')).toEqual({ skipped: 'no recording yet' });

    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(row());
    vi.mocked(calls.claimTranscription).mockResolvedValue(undefined);
    expect(await processTwilioCall('CA123')).toEqual({ skipped: 'transcription already running or done' });
    expect(extractCall).not.toHaveBeenCalled();
    expect(leads.createLead).not.toHaveBeenCalled();
  });

  it('marks the row failed and rethrows when transcription blows up', async () => {
    const bare = row({ transcript: null });
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(bare);
    vi.mocked(calls.claimTranscription).mockResolvedValue(bare);
    vi.mocked(transcribeRecording).mockRejectedValueOnce(new Error('deepgram down'));
    await expect(processTwilioCall('CA123')).rejects.toThrow('deepgram down');
    expect(calls.finalizeCall).toHaveBeenCalledWith('call-uuid', { status: 'failed', transcriptionStatus: 'failed' });
  });
});

describe('processCallEnd — AI-answered (Vapi)', () => {
  it('links to a Twilio parent, extracts in AI mode, never stamps a human touch', async () => {
    const vapiRow = row({ platform: 'vapi', platformCallId: 'vapi-1', answeredBy: 'ai', answeredByName: null, status: 'received', recordingSid: null });
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(vapiRow);
    vi.mocked(calls.getCallById).mockResolvedValue(row({ ...vapiRow, status: 'processed', leadId: 'lead-1' }));
    vi.mocked(extractCall).mockResolvedValue({ ...extraction, followUps: undefined, booking: undefined } as never);

    await processCallEnd(
      {
        platform: 'vapi',
        platformCallId: 'vapi-1',
        fromNumber: '+18175550142',
        toNumber: '+19402917613',
        forwardedFrom: null,
        startedAt,
        endedAt,
        durationSec: 90,
        endedReason: 'customer-ended-call',
        recordingUrl: 'https://s3/rec.wav',
        transcript: [{ role: 'user', text: 'I want a discovery flight please' }],
        platformSummary: null,
        answeredBy: 'ai',
        answeredByName: null,
        parentCallId: 'CA999',
      },
      {},
    );
    expect(calls.linkChildCall).toHaveBeenCalledWith(expect.objectContaining({ childPlatformCallId: 'vapi-1', explicitParentSid: 'CA999' }));
    expect(vi.mocked(extractCall).mock.calls[0][4]).toEqual({ kind: 'ai' });
    const created = vi.mocked(leads.createLead).mock.calls[0][0];
    expect(created.attribution).toEqual({ utm_source: 'phone', utm_campaign: 'missed-call' });
    expect(created.createdAt).toBeUndefined();
    expect(leads.markContactedAt).not.toHaveBeenCalled();
    expect(vi.mocked(sendAdminNotification).mock.calls[0][1]!.call!.answeredBy).toBe('ai');
  });
});

// Jim 2026-11-22: "the phone calls we want to treat just like we're treating
// the internet leads… the voicemail will go to them."
describe('who a phone lead goes to', () => {
  const mark = { id: 'user-mark', name: 'Mark King', email: 'mark@example.com' };
  const missed = {
    platform: 'vapi' as const,
    platformCallId: 'vapi-2',
    fromNumber: '+18175550142',
    toNumber: '+19402917613',
    forwardedFrom: null,
    startedAt,
    endedAt,
    durationSec: 90,
    endedReason: 'customer-ended-call',
    recordingUrl: null,
    transcript: [{ role: 'user' as const, text: 'I want a discovery flight please' }],
    platformSummary: null,
    answeredBy: 'ai' as const,
    answeredByName: null,
    parentCallId: null,
  };
  const aiRow = () =>
    row({ platform: 'vapi', platformCallId: 'vapi-2', answeredBy: 'ai', answeredByName: null, status: 'received' });

  it('hands a call the AI took to the next person and addresses the alert to them', async () => {
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(aiRow());
    vi.mocked(handOutLeadSafely).mockResolvedValue(mark);
    await processCallEnd(missed, {});
    expect(handOutLeadSafely).toHaveBeenCalledWith('lead-1');
    expect(vi.mocked(sendAdminNotification).mock.calls[0][1]!.owner).toEqual(mark);
  });

  it('leaves a repeat caller with the person who already has them', async () => {
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(aiRow());
    const held = { ...lead, ownerId: mark.id, createdAt: new Date(endedAt.getTime() - 3600_000) } as Lead;
    vi.mocked(leads.findRecentLeadByPhone).mockResolvedValue(held);
    vi.mocked(ownerOf).mockResolvedValue(mark);
    await processCallEnd(missed, {});
    expect(handOutLeadSafely).not.toHaveBeenCalled();
    expect(vi.mocked(sendAdminNotification).mock.calls[0][1]!.owner).toEqual(mark);
  });

  it('does not hand out a call a person answered', async () => {
    const r = row();
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(r);
    vi.mocked(calls.claimTranscription).mockResolvedValue(r);
    vi.mocked(calls.upsertTwilioCall).mockResolvedValue(r);
    await processTwilioCall('CA123');
    expect(handOutLeadSafely).not.toHaveBeenCalled();
    expect(vi.mocked(sendAdminNotification).mock.calls[0][1]!.owner).toBeNull();
  });

  // Jim 2026-11-27: a caller who asks for a person is rung through to the next
  // person on the rotation; "it skips them if they didn't answer the phone".
  describe('after a caller asked for a person', () => {
    const jimL = { userId: 'user-jim', name: 'Jim Lewis', number: '+18175550102' };
    const markP = { userId: mark.id, name: mark.name, number: '+18175550101' };
    const rung = (over: Record<string, unknown>) =>
      row({
        platformCallId: 'CAparent',
        answeredBy: 'ai',
        answeredByName: null,
        status: 'forwarded_to_ai',
        ringThrough: { step: 0, plan: [jimL, markP], legSid: null, callerName: null, startedAt: '', ...over },
      } as Partial<Call>);
    const aiChild = () => ({ ...aiRow(), parentCallId: 'CAparent' }) as Call;

    it('the lead is the person who took the call, and the alert says they were put through', async () => {
      vi.mocked(calls.upsertCallEnded).mockResolvedValue(aiChild());
      vi.mocked(calls.getCallByPlatformId).mockResolvedValue(
        rung({ state: 'connected', step: 1, answeredUserId: mark.id, answeredName: mark.name }),
      );
      vi.mocked(giveLeadToSafely).mockResolvedValue(mark);
      await processCallEnd(missed, {});
      expect(giveLeadToSafely).toHaveBeenCalledWith('lead-1', mark.id);
      expect(handOutLeadSafely).not.toHaveBeenCalled();
      const sent = vi.mocked(sendAdminNotification).mock.calls[0][1]!;
      expect(sent.owner).toEqual(mark);
      expect(sent.call!.putThroughTo).toBe('Mark King');
      expect(sent.call!.rangNoAnswer).toEqual(['Jim Lewis']);
    });

    it('when nobody took it, everyone who was rung is skipped for this lead', async () => {
      vi.mocked(calls.upsertCallEnded).mockResolvedValue(aiChild());
      vi.mocked(calls.getCallByPlatformId).mockResolvedValue(rung({ state: 'missed', step: 1 }));
      const kristen = { id: 'user-kristen', name: 'Kristen', email: 'kristen@example.com' };
      vi.mocked(handOutLeadSafely).mockResolvedValue(kristen);
      await processCallEnd(missed, {});
      expect(giveLeadToSafely).not.toHaveBeenCalled();
      expect(vi.mocked(handOutLeadSafely).mock.calls[0][0]).toBe('lead-1');
      expect(vi.mocked(handOutLeadSafely).mock.calls[0][2]).toEqual({ skip: ['user-jim', mark.id] });
      const sent = vi.mocked(sendAdminNotification).mock.calls[0][1]!;
      expect(sent.owner).toEqual(kristen);
      expect(sent.call!.putThroughTo).toBeNull();
      expect(sent.call!.rangNoAnswer).toEqual(['Jim Lewis', 'Mark King']);
    });

    it('a caller who left while it rang is handed out the usual way', async () => {
      vi.mocked(calls.upsertCallEnded).mockResolvedValue(aiChild());
      vi.mocked(calls.getCallByPlatformId).mockResolvedValue(rung({ state: 'ended' }));
      vi.mocked(handOutLeadSafely).mockResolvedValue(mark);
      await processCallEnd(missed, {});
      expect(handOutLeadSafely).toHaveBeenCalledWith('lead-1');
      expect(vi.mocked(sendAdminNotification).mock.calls[0][1]!.call!.rangNoAnswer).toEqual([]);
    });

    it('the notes from the conversation with the person go to that person, not the shared inbox', async () => {
      const r = rung({ state: 'connected', step: 0, answeredUserId: 'user-jim', answeredName: 'Jim Lewis' });
      const talked = { ...r, answeredBy: 'human', answeredByName: 'Jim Lewis', status: 'answered' } as Call;
      vi.mocked(calls.getCallByPlatformId).mockResolvedValue(talked);
      vi.mocked(calls.claimTranscription).mockResolvedValue(talked);
      vi.mocked(calls.upsertTwilioCall).mockResolvedValue(talked);
      const jimOwner = { id: 'user-jim', name: 'Jim Lewis', email: 'jim@example.com' };
      vi.mocked(giveLeadToSafely).mockResolvedValue(jimOwner);
      await processTwilioCall('CAparent');
      expect(giveLeadToSafely).toHaveBeenCalledWith('lead-1', 'user-jim');
      const sent = vi.mocked(sendAdminNotification).mock.calls[0][1]!;
      expect(sent.owner).toEqual(jimOwner);
      expect(sent.call!.answeredBy).toBe('human');
      expect(sent.call!.putThroughTo).toBeNull();
    });
  });
});

// Jim 2026-11-27: he and Mark rang the line to try the assistant; it became a
// lead for Jim Lewis and chased him to call a customer who did not exist.
describe('a call from one of our own phones', () => {
  const marksCell = '+18175550111';
  const tryout = {
    platform: 'vapi' as const,
    platformCallId: 'vapi-9',
    fromNumber: marksCell,
    toNumber: '+19402917613',
    forwardedFrom: null,
    startedAt,
    endedAt,
    durationSec: 90,
    endedReason: 'customer-ended-call',
    recordingUrl: null,
    transcript: [{ role: 'user' as const, text: 'This is Blue Whatley, I want a discovery flight' }],
    platformSummary: null,
    answeredBy: 'ai' as const,
    answeredByName: null,
    parentCallId: null,
  };
  const tryoutRow = (over: Partial<Call> = {}) =>
    row({ platform: 'vapi', platformCallId: 'vapi-9', fromNumber: marksCell, answeredBy: 'ai', answeredByName: null, status: 'received', ...over });

  beforeEach(() => {
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(tryoutRow());
    vi.mocked(testCallerFor).mockImplementation(async (from) => (from === marksCell ? 'Mark King' : null));
  });

  it('is kept with its summary and makes no lead, uses no turn and sends no email', async () => {
    await processCallEnd(tryout, {});
    expect(calls.finalizeCall).toHaveBeenCalledWith('call-uuid', {
      status: 'test',
      extracted: extraction,
      summary: extraction.summary,
    });
    expect(leads.createLead).not.toHaveBeenCalled();
    expect(leads.findRecentLeadByPhone).not.toHaveBeenCalled();
    expect(leads.addLeadNote).not.toHaveBeenCalled();
    expect(handOutLeadSafely).not.toHaveBeenCalled();
    expect(giveLeadToSafely).not.toHaveBeenCalled();
    expect(sendAdminNotification).not.toHaveBeenCalled();
  });

  it('uses no turn even when the caller asked for a person and somebody took it', async () => {
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(
      row({
        platformCallId: 'CA777',
        ringThrough: {
          state: 'ended',
          step: 0,
          plan: [{ userId: 'user-jim', name: 'Jim Lewis', number: '+18175550122' }],
          legSid: 'CA778',
          callerName: null,
          startedAt: startedAt.toISOString(),
          answeredUserId: 'user-jim',
          answeredName: 'Jim Lewis',
        },
      } as Partial<Call>),
    );
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(tryoutRow({ parentCallId: 'CA777' }));
    await processCallEnd({ ...tryout, parentCallId: 'CA777' }, {});
    expect(giveLeadToSafely).not.toHaveBeenCalled();
    expect(leads.createLead).not.toHaveBeenCalled();
  });

  it('a hang-up is filed as a test without asking the model', async () => {
    await processCallEnd({ ...tryout, durationSec: 2, transcript: [] }, {});
    expect(extractCall).not.toHaveBeenCalled();
    expect(calls.finalizeCall).toHaveBeenCalledWith('call-uuid', { status: 'test' });
  });

  it('is still filed as a test when the summary cannot be written', async () => {
    vi.mocked(extractCall).mockRejectedValue(new Error('model down'));
    await processCallEnd(tryout, {});
    expect(calls.finalizeCall).toHaveBeenCalledWith('call-uuid', { status: 'test' });
    expect(calls.finalizeCall).not.toHaveBeenCalledWith('call-uuid', expect.objectContaining({ status: 'failed' }));
  });

  it('a second report of the same call does nothing', async () => {
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(tryoutRow({ status: 'test' }));
    await processCallEnd(tryout, {});
    expect(extractCall).not.toHaveBeenCalled();
    expect(calls.finalizeCall).not.toHaveBeenCalled();
  });

  it('a call a person answered from one of our phones is a test too', async () => {
    const r = row({ fromNumber: marksCell });
    vi.mocked(calls.getCallByPlatformId).mockResolvedValue(r);
    vi.mocked(calls.claimTranscription).mockResolvedValue(r);
    await processTwilioCall('CA123');
    expect(calls.finalizeCall).toHaveBeenCalledWith('call-uuid', {
      status: 'test',
      extracted: extraction,
      summary: extraction.summary,
      transcriptionStatus: 'done',
    });
    expect(leads.createLead).not.toHaveBeenCalled();
    expect(leads.markContactedAt).not.toHaveBeenCalled();
    expect(sendAdminNotification).not.toHaveBeenCalled();
  });

  it('filed as a real call on an admin\'s word: the lead is made and handed out', async () => {
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(tryoutRow({ status: 'test' }));
    await processCallEnd(tryout, {}, { real: true });
    expect(testCallerFor).not.toHaveBeenCalled();
    expect(leads.createLead).toHaveBeenCalledTimes(1);
    expect(handOutLeadSafely).toHaveBeenCalledWith('lead-1');
    expect(sendAdminNotification).toHaveBeenCalledTimes(1);
  });

  it('a customer is handled exactly as before', async () => {
    vi.mocked(calls.upsertCallEnded).mockResolvedValue(tryoutRow({ fromNumber: '+18175550142' }));
    await processCallEnd({ ...tryout, fromNumber: '+18175550142' }, {});
    expect(leads.createLead).toHaveBeenCalledTimes(1);
    expect(handOutLeadSafely).toHaveBeenCalledWith('lead-1');
  });
});

describe('processRawPayload', () => {
  it('refuses twilio and ignores unknown platforms', async () => {
    await expect(processRawPayload('twilio', {})).rejects.toThrow(/processTwilioCall/);
    expect(await processRawPayload('nope' as never, {})).toEqual({ ignored: 'unknown platform nope' });
  });
});
