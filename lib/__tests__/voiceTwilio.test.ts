import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  aiFallbackTwiml,
  escapeXml,
  inboundDialTwiml,
  isBusinessHours,
  parseForm,
  recordingLink,
  ringTargets,
  ringTimeoutSec,
  routeUrl,
  routingMode,
  twilioSignature,
  verifyTwilioSignature,
  whisperLine,
  whisperTwiml,
} from '../voice/twilio';

const BASE = 'https://www.goflytexas.com';

describe('config parsing', () => {
  it('routingMode defaults to ai_only and rejects junk', () => {
    expect(routingMode({})).toBe('ai_only');
    expect(routingMode({ VOICE_ROUTING_MODE: 'humans_first' })).toBe('humans_first');
    expect(routingMode({ VOICE_ROUTING_MODE: 'yolo' })).toBe('ai_only');
  });
  it('ringTargets parses either order, drops invalid/dupes/reserved numbers', () => {
    const env = {
      VOICE_RING_TARGETS: '+18175551234:Jim, Ann:(817) 555-5678, junk, +18175551234:Dup, +19409053090:Loop',
      VOICE_PUBLISHED_NUMBER: '+19409053090',
    };
    expect(ringTargets(env)).toEqual([
      { name: 'Jim', number: '+18175551234' },
      { name: 'Ann', number: '+18175555678' },
    ]);
    expect(ringTargets({})).toEqual([]);
    expect(ringTimeoutSec({ VOICE_RING_TIMEOUT: '90' })).toBe(45);
    expect(ringTimeoutSec({})).toBe(20);
  });
});

describe('isBusinessHours', () => {
  const tz = 'America/Chicago';
  it('respects the window in local time (CDT = UTC-5)', () => {
    expect(isBusinessHours(new Date('2026-08-29T12:59:00Z'), tz, '08:00-17:00')).toBe(false); // 07:59 CT
    expect(isBusinessHours(new Date('2026-08-29T13:00:00Z'), tz, '08:00-17:00')).toBe(true); // 08:00 CT
    expect(isBusinessHours(new Date('2026-08-29T21:59:00Z'), tz, '08:00-17:00')).toBe(true); // 16:59 CT
    expect(isBusinessHours(new Date('2026-08-29T22:00:00Z'), tz, '08:00-17:00')).toBe(false); // 17:00 CT
  });
  it('handles standard time (CST = UTC-6) and malformed windows', () => {
    expect(isBusinessHours(new Date('2026-12-15T14:00:00Z'), tz, '08:00-17:00')).toBe(true); // 08:00 CST
    expect(isBusinessHours(new Date('2026-12-15T13:59:00Z'), tz, '08:00-17:00')).toBe(false);
    expect(isBusinessHours(new Date('2026-12-15T03:00:00Z'), tz, 'nope')).toBe(true);
  });
});

describe('TwiML', () => {
  it('escapes XML in whispers and URLs', () => {
    expect(escapeXml(`Tom & "Jerry" <3 'x'`)).toBe('Tom &amp; &quot;Jerry&quot; &lt;3 &apos;x&apos;');
    const x = whisperTwiml({ baseUrl: BASE, parentSid: 'CA1', targetIndex: 0, line: 'Call from Tom & Jerry' });
    expect(x).toContain('Tom &amp; Jerry');
    expect(x).toContain('action="https://www.goflytexas.com/api/voice/twilio/gather?parent=CA1&amp;t=0"');
    expect(x).toContain('<Gather input="dtmf" numDigits="1" timeout="4"');
    expect(x.endsWith('<Hangup/></Response>')).toBe(true);
  });
  it('builds one <Number> per target with whisper URLs and dual recording', () => {
    const x = inboundDialTwiml({
      baseUrl: BASE,
      parentSid: 'CAabc',
      targets: [
        { name: 'Jim', number: '+18175551234' },
        { name: 'Ann', number: '+18175555678' },
      ],
      timeoutSec: 20,
    });
    expect(x.match(/<Number /g)).toHaveLength(2);
    expect(x).toContain('record="record-from-answer-dual"');
    expect(x).toContain('answerOnBridge="true"');
    expect(x).toContain('whisper?parent=CAabc&amp;t=1');
    expect(x).toContain('dial-result?parent=CAabc');
    expect(x).not.toContain('callerId=');
  });
  it('AI fallback prefers SIP when given, else the number, else just apologises', () => {
    expect(aiFallbackTwiml({ aiNumber: '+19402917613' })).toContain('<Number>+19402917613</Number>');
    expect(aiFallbackTwiml({ aiNumber: '+19402917613', aiSipUri: 'sip:x@sip.vapi.ai' })).toContain('<Sip>sip:x@sip.vapi.ai</Sip>');
    expect(aiFallbackTwiml({ aiNumber: null })).not.toContain('<Dial');
  });
  it('routeUrl strips unsafe query characters', () => {
    expect(routeUrl(BASE + '/', '/x', { parent: 'CA1<>"', t: 2 })).toBe('https://www.goflytexas.com/x?parent=CA1&t=2');
  });
});

describe('whisperLine', () => {
  const now = new Date('2026-08-29T20:00:00Z');
  it('names a known caller with when and what', () => {
    const line = whisperLine(
      { name: 'Sarah Mitchell', lastInterest: 'discovery', priorCalls: 1, lastAt: new Date('2026-08-25T15:00:00Z') },
      '+18175550142',
      now,
    );
    expect(line).toBe('GoFlyTexas call from Sarah Mitchell, called Tuesday about a discovery flight. Press 1 to accept.');
    expect(line.split(' ').length).toBeLessThanOrEqual(22);
  });
  it('falls back to repeat-caller, spoken number, or withheld', () => {
    expect(whisperLine({ name: null, lastInterest: 'rental', priorCalls: 2, lastAt: null }, '+18175550142', now)).toBe(
      'GoFlyTexas call, repeat caller about aircraft rental. Press 1 to accept.',
    );
    expect(whisperLine({ name: null, lastInterest: null, priorCalls: 0, lastAt: null }, '+18175550142', now)).toBe(
      'GoFlyTexas call from 817 555 0142. Press 1 to accept.',
    );
    expect(whisperLine({ name: 'Unknown caller', lastInterest: null, priorCalls: 0, lastAt: null }, null, now)).toBe(
      'GoFlyTexas call, caller ID withheld. Press 1 to accept.',
    );
  });
});

describe('signature', () => {
  it('matches the Twilio documentation vector', () => {
    const params = {
      CallSid: 'CA1234567890ABCDE',
      Caller: '+12349013030',
      Digits: '1234',
      From: '+12349013030',
      To: '+18005551212',
    };
    expect(twilioSignature('12345', 'https://mycompany.com/myapp.php?foo=1&bar=2', params)).toBe(
      '0/KCTR6DLpKmkAf8muzZqo1nDgQ=',
    );
  });
  it('verifies against any candidate URL, rejects tampering and missing headers', () => {
    const params = parseForm('CallSid=CA1&From=%2B18175550142&Digits=1');
    const url = `${BASE}/api/voice/twilio/gather?parent=CA1&t=0`;
    const sig = createHmac('sha1', 'tok')
      .update(url + 'CallSidCA1Digits1From+18175550142')
      .digest('base64');
    expect(verifyTwilioSignature({ authToken: 'tok', signature: sig, urls: ['https://other/x', url], params })).toBe(true);
    expect(verifyTwilioSignature({ authToken: 'tok', signature: sig, urls: [url], params: { ...params, Digits: '2' } })).toBe(false);
    expect(verifyTwilioSignature({ authToken: 'tok', signature: null, urls: [url], params })).toBe(false);
    expect(verifyTwilioSignature({ authToken: 'wrong', signature: sig, urls: [url], params })).toBe(false);
  });
});

describe('recordingLink', () => {
  it('proxies Twilio media by recording sid', () => {
    expect(
      recordingLink({ id: 'c1', platform: 'twilio', recordingUrl: 'https://api.twilio.com/x', recordingSid: 'RE1' }, BASE + '/'),
    ).toBe('https://www.goflytexas.com/admin/calls/recording/RE1');
    expect(recordingLink({ id: 'c1', platform: 'twilio', recordingUrl: null, recordingSid: null }, BASE)).toBeNull();
  });
  it('proxies Vapi recordings by our call id (their URLs are not playable as stored)', () => {
    expect(
      recordingLink({ id: '17feb10d-7a45-4364-ad3b-388144757db0', platform: 'vapi', recordingUrl: 'https://r2/x.wav' }, BASE),
    ).toBe('https://www.goflytexas.com/admin/calls/recording/17feb10d-7a45-4364-ad3b-388144757db0');
    expect(recordingLink({ id: 'c2', platform: 'vapi', recordingUrl: null }, BASE)).toBeNull();
  });
});
