import { describe, expect, it } from 'vitest';
import { sayOnCall, twilioRest, twilioRestFromEnv } from '../voice/twilioRest';

// The request shapes sent to Twilio and to the assistant platform. No network:
// a stand-in fetch records what would have been sent.
function recorder(answer: { status?: number; body?: unknown } = {}) {
  const seen: { url: string; method?: string; headers: Record<string, string>; body: string }[] = [];
  const fetchImpl = (async (url: unknown, init?: RequestInit) => {
    seen.push({
      url: String(url),
      method: init?.method,
      headers: init?.headers as Record<string, string>,
      body: String(init?.body ?? ''),
    });
    return new Response(JSON.stringify(answer.body ?? { sid: 'CAnew' }), { status: answer.status ?? 201 });
  }) as typeof fetch;
  return { seen, fetchImpl };
}

describe('placing a call to a team member', () => {
  it('posts the cell, our number, the ring time and where to report back', async () => {
    const r = recorder();
    const rest = twilioRest({ accountSid: 'ACtest', authToken: 'tok', fetchImpl: r.fetchImpl });
    const { sid } = await rest.createCall({
      to: '+18175550101',
      from: '+19402423072',
      url: 'https://www.goflytexas.com/api/voice/twilio/ring-through/whisper?parent=CA1&step=0',
      statusCallback: 'https://www.goflytexas.com/api/voice/twilio/ring-through/leg-status?parent=CA1&step=0',
      timeoutSec: 12,
    });
    expect(sid).toBe('CAnew');
    expect(r.seen[0].url).toBe('https://api.twilio.com/2010-04-01/Accounts/ACtest/Calls.json');
    expect(r.seen[0].method).toBe('POST');
    expect(r.seen[0].headers.Authorization).toBe(`Basic ${Buffer.from('ACtest:tok').toString('base64')}`);
    const form = new URLSearchParams(r.seen[0].body);
    expect(form.get('To')).toBe('+18175550101');
    expect(form.get('From')).toBe('+19402423072');
    expect(form.get('Timeout')).toBe('12');
    expect(form.get('StatusCallbackEvent')).toBe('completed');
    expect(form.get('Url')).toContain('/ring-through/whisper?parent=CA1&step=0');
    expect(form.get('StatusCallback')).toContain('/ring-through/leg-status?parent=CA1&step=0');
  });

  it('fails loudly, with Twilio\'s reason, when the call is refused', async () => {
    const r = recorder({ status: 400, body: { code: 21215, message: 'Geo permission' } });
    const rest = twilioRest({ accountSid: 'ACtest', authToken: 'tok', fetchImpl: r.fetchImpl });
    await expect(
      rest.createCall({ to: '+1', from: '+1', url: 'https://x', statusCallback: 'https://x', timeoutSec: 12 }),
    ).rejects.toThrow(/400.*21215/);
  });

  it('treats an answer with no call id as a failure', async () => {
    const r = recorder({ body: {} });
    const rest = twilioRest({ accountSid: 'ACtest', authToken: 'tok', fetchImpl: r.fetchImpl });
    await expect(
      rest.createCall({ to: '+1', from: '+1', url: 'https://x', statusCallback: 'https://x', timeoutSec: 12 }),
    ).rejects.toThrow(/no call sid/);
  });
});

describe('changing a call that is under way', () => {
  it('moves a caller with new markup', async () => {
    const r = recorder({ status: 200 });
    const rest = twilioRest({ accountSid: 'ACtest', authToken: 'tok', fetchImpl: r.fetchImpl });
    await rest.updateCall('CAparent', { twiml: '<Response><Hangup/></Response>' });
    expect(r.seen[0].url).toBe('https://api.twilio.com/2010-04-01/Accounts/ACtest/Calls/CAparent.json');
    expect(new URLSearchParams(r.seen[0].body).get('Twiml')).toBe('<Response><Hangup/></Response>');
  });

  it('hangs up a cell that is still ringing', async () => {
    const r = recorder({ status: 200 });
    const rest = twilioRest({ accountSid: 'ACtest', authToken: 'tok', fetchImpl: r.fetchImpl });
    await rest.updateCall('CAleg1', { status: 'completed' });
    expect(new URLSearchParams(r.seen[0].body).get('Status')).toBe('completed');
  });
});

describe('the account settings', () => {
  it('there is no client without both the account id and its token', () => {
    expect(twilioRestFromEnv({})).toBeNull();
    expect(twilioRestFromEnv({ TWILIO_ACCOUNT_SID: 'ACtest' })).toBeNull();
    expect(twilioRestFromEnv({ TWILIO_ACCOUNT_SID: 'ACtest', TWILIO_AUTH_TOKEN: 'tok' })).not.toBeNull();
  });
});

describe('making the assistant say a line', () => {
  it('posts a say message and reports whether it was taken', async () => {
    const r = recorder({ status: 200, body: {} });
    expect(await sayOnCall('https://x.vapi.ai/call/control', 'Sorry.', { fetchImpl: r.fetchImpl })).toBe(true);
    expect(JSON.parse(r.seen[0].body)).toEqual({ type: 'say', content: 'Sorry.', endCallAfterSpoken: false });
    const refused = recorder({ status: 404 });
    expect(await sayOnCall('https://x.vapi.ai/call/control', 'Sorry.', { fetchImpl: refused.fetchImpl })).toBe(false);
  });

  it('a network failure is a no, not an exception', async () => {
    const broken = (async () => {
      throw new Error('socket hang up');
    }) as unknown as typeof fetch;
    expect(await sayOnCall('https://x.vapi.ai/call/control', 'Sorry.', { fetchImpl: broken })).toBe(false);
  });
});
