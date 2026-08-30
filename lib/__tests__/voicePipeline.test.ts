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
vi.mock('../voice/extract', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../voice/extract')>();
  return { ...actual, extractCall: vi.fn() };
});
vi.mock('../voice/transcribe', () => ({
  transcribeRecording: vi.fn(async () => ({ turns: [{ role: 'user', text: 'transcribed words here' }], raw: {}, channels: 2 })),
  twilioTranscribeOpts: vi.fn(() => ({ accountSid: 'a', authToken: 'b', deepgramKey: 'c' })),
}));

import * as calls from '@/lib/calls';
import * as leads from '@/lib/leads';
import { sendAdminNotification } from '@/lib/email';
import { extractCall } from '../voice/extract';
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

describe('processRawPayload', () => {
  it('refuses twilio and ignores unknown platforms', async () => {
    await expect(processRawPayload('twilio', {})).rejects.toThrow(/processTwilioCall/);
    expect(await processRawPayload('nope' as never, {})).toEqual({ ignored: 'unknown platform nope' });
  });
});
