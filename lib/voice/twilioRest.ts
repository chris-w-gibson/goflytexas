/**
 * The two Twilio REST calls the ring-through needs: place a call to a team
 * member's cell, and change a call that is under way (move the caller into the
 * room, or hang up a cell that is still ringing). Plain fetch with Basic auth;
 * `fetchImpl` is injectable so the request shapes are unit-tested.
 */

export const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

export type TwilioRestOpts = {
  accountSid: string;
  authToken: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
};

export type TwilioRest = {
  createCall(i: { to: string; from: string; url: string; statusCallback: string; timeoutSec: number }): Promise<{ sid: string }>;
  updateCall(sid: string, i: { twiml: string } | { status: 'completed' }): Promise<void>;
};

/** Null when the account is not configured: the caller of this treats that as "nobody could be rung". */
export function twilioRestFromEnv(env: Record<string, string | undefined> = process.env): TwilioRest | null {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  return accountSid && authToken ? twilioRest({ accountSid, authToken }) : null;
}

export function twilioRest(opts: TwilioRestOpts): TwilioRest {
  const doFetch = opts.fetchImpl ?? fetch;
  const auth = `Basic ${Buffer.from(`${opts.accountSid}:${opts.authToken}`).toString('base64')}`;
  const post = async (path: string, form: Record<string, string>): Promise<unknown> => {
    const res = await doFetch(`${TWILIO_API_BASE}/Accounts/${encodeURIComponent(opts.accountSid)}${path}`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(form).toString(),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 8_000),
    });
    if (!res.ok) {
      // Twilio's error body names the reason (21215 geo permission, 21211 bad number…) and holds no secret.
      const detail = await res.text().catch(() => '');
      throw new Error(`twilio ${path.split('/')[1]} ${res.status}: ${detail.slice(0, 200)}`);
    }
    return res.json().catch(() => ({}));
  };
  return {
    async createCall(i) {
      const body = (await post('/Calls.json', {
        To: i.to,
        From: i.from,
        Url: i.url,
        Method: 'POST',
        Timeout: String(i.timeoutSec),
        StatusCallback: i.statusCallback,
        StatusCallbackMethod: 'POST',
        StatusCallbackEvent: 'completed',
      })) as { sid?: unknown };
      if (typeof body.sid !== 'string' || !body.sid) throw new Error('twilio Calls.json: no call sid in the answer');
      return { sid: body.sid };
    },
    async updateCall(sid, i) {
      await post(`/Calls/${encodeURIComponent(sid)}.json`, 'twiml' in i ? { Twiml: i.twiml } : { Status: i.status });
    },
  };
}

/**
 * Make the assistant say a sentence on a live call through the platform's
 * control address (Vapi live call control: `{"type":"say","content":…}`).
 * Best effort: false when it could not be said.
 */
export async function sayOnCall(
  controlUrl: string,
  content: string,
  opts?: { fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<boolean> {
  try {
    const res = await (opts?.fetchImpl ?? fetch)(controlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'say', content, endCallAfterSpoken: false }),
      signal: AbortSignal.timeout(opts?.timeoutMs ?? 4_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
