import { describe, expect, it, vi } from 'vitest';
import { fetchVapiRecording, pickPresignedRecording } from '../voice/vapi';

describe('pickPresignedRecording', () => {
  it('prefers stereo, falls back to mono, carries the expiry', () => {
    expect(
      pickPresignedRecording({ presignedStereoUrl: 'https://r2/s.wav?X-Amz-Signature=1', presignedMonoUrl: 'https://r2/m.wav', presignedUrlsExpiresAt: '2026-09-02T03:00:40.074Z' }),
    ).toEqual({ url: 'https://r2/s.wav?X-Amz-Signature=1', expiresAt: '2026-09-02T03:00:40.074Z' });
    expect(pickPresignedRecording({ presignedMonoUrl: 'https://r2/m.wav' })).toEqual({ url: 'https://r2/m.wav', expiresAt: null });
  });
  it('ignores the bare (unsigned) recordingUrl and junk', () => {
    expect(pickPresignedRecording({ recordingUrl: 'https://r2/bare.wav' })).toBeNull();
    expect(pickPresignedRecording({ presignedStereoUrl: '' })).toBeNull();
    expect(pickPresignedRecording(null)).toBeNull();
    expect(pickPresignedRecording('nope')).toBeNull();
  });
});

describe('fetchVapiRecording', () => {
  it('GETs the call with a bearer token and picks the presigned url', async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe('https://api.vapi.ai/call/01a05a3a-cab7-7000-a232-37e43f40bf8a');
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer k');
      return new Response(JSON.stringify({ artifact: { presignedMonoUrl: 'https://r2/m.wav?sig' } }), { status: 200 });
    });
    const rec = await fetchVapiRecording('01a05a3a-cab7-7000-a232-37e43f40bf8a', { apiKey: 'k', fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(rec).toEqual({ url: 'https://r2/m.wav?sig', expiresAt: null });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
  it('returns null on a non-2xx or a call without recordings', async () => {
    const notFound = (async () => new Response('{}', { status: 404 })) as unknown as typeof fetch;
    expect(await fetchVapiRecording('x', { apiKey: 'k', fetchImpl: notFound })).toBeNull();
    const noArtifact = (async () => new Response(JSON.stringify({ artifact: {} }), { status: 200 })) as unknown as typeof fetch;
    expect(await fetchVapiRecording('x', { apiKey: 'k', fetchImpl: noArtifact })).toBeNull();
  });
});
