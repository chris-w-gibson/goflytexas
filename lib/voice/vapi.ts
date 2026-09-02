/**
 * Vapi REST helpers. Vapi's end-of-call report hands us bare R2 object URLs
 * (`recordingUrl`, `stereoRecordingUrl`) that are NOT publicly readable — R2
 * answers 400 InvalidArgument/Authorization. Playable links are the presigned
 * ones on the call artifact, and they expire ~30 minutes after they're minted,
 * so we fetch a fresh set at click time instead of storing them.
 */

export const VAPI_API_BASE = 'https://api.vapi.ai';

export type PresignedRecording = { url: string; expiresAt: string | null };

type Artifact = {
  presignedStereoUrl?: unknown;
  presignedMonoUrl?: unknown;
  presignedUrlsExpiresAt?: unknown;
};

const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);

/** Prefer stereo (caller + assistant on separate channels), fall back to mono. */
export function pickPresignedRecording(artifact: unknown): PresignedRecording | null {
  if (!artifact || typeof artifact !== 'object') return null;
  const a = artifact as Artifact;
  const url = str(a.presignedStereoUrl) ?? str(a.presignedMonoUrl);
  if (!url) return null;
  return { url, expiresAt: str(a.presignedUrlsExpiresAt) };
}

export async function fetchVapiRecording(
  platformCallId: string,
  opts: { apiKey: string; fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<PresignedRecording | null> {
  const doFetch = opts.fetchImpl ?? fetch;
  const res = await doFetch(`${VAPI_API_BASE}/call/${encodeURIComponent(platformCallId)}`, {
    headers: { Authorization: `Bearer ${opts.apiKey}` },
    signal: AbortSignal.timeout(opts.timeoutMs ?? 15_000),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { artifact?: unknown };
  return pickPresignedRecording(body.artifact);
}
