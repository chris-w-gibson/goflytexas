import Link from 'next/link';
import { listCalls, listChildrenByParent } from '@/lib/calls';
import type { Call } from '@/lib/db/schema';
import { formatCallDuration } from '@/lib/followup';
import { formatPhoneDisplay } from '@/lib/voice/phone';
import { recordingLink } from '@/lib/voice/twilio';
import { reprocessCallAction } from './actions';

export const dynamic = 'force-dynamic';

function whenCT(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function badge(status: string): string {
  switch (status) {
    case 'processed':
      return 'bg-green-100 text-green-900';
    case 'answered':
      return 'bg-indigo-100 text-indigo-900';
    case 'ringing':
      return 'bg-sky-100 text-sky-900 animate-pulse';
    case 'forwarded_to_ai':
    case 'passthrough':
      return 'bg-slate-100 text-slate-600';
    case 'no_message':
      return 'bg-slate-200 text-slate-700';
    case 'spam':
      return 'bg-amber-100 text-amber-900';
    case 'failed':
      return 'bg-red-100 text-red-900';
    default:
      return 'bg-sky-100 text-sky-900';
  }
}

function answeredLabel(c: Call): string {
  if (c.answeredBy === 'human') return c.answeredByName ?? 'Team';
  if (c.answeredBy === 'ai') return 'AI';
  if (c.status === 'ringing') return 'ringing…';
  return 'no answer';
}

function staffLabel(c: Call): string {
  return c.answeredBy === 'human' ? c.answeredByName ?? 'Staff' : 'AI';
}

function summaryLine(c: Call): string {
  if (c.summary) return c.summary;
  const firstUser = c.transcript?.find((t) => t.role === 'user')?.text;
  if (firstUser) return firstUser;
  if (c.status === 'no_message') return 'No message left';
  if (c.status === 'forwarded_to_ai') return 'Handed to the AI assistant';
  if (c.status === 'answered') return 'Answered — waiting for the recording';
  return c.status === 'received' || c.status === 'ringing' ? 'Call in progress or no report yet' : '';
}

function canReprocess(c: Call): boolean {
  if (c.platform === 'twilio') return c.answeredBy === 'human' && !!c.recordingUrl;
  return (c.status === 'failed' || c.status === 'received') && !!c.rawPayload;
}

export default async function CallsPage({
  searchParams,
}: {
  searchParams?: { focus?: string };
}) {
  const calls = await listCalls({ limit: 100 });
  const focus = searchParams?.focus;
  const children = await listChildrenByParent(
    calls.filter((c) => c.platform === 'twilio' && c.status === 'forwarded_to_ai').map((c) => c.platformCallId),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calls</h1>
        <p className="text-sm text-slate-600 mt-1">
          Every call to (940) 905-3090. Answered calls are transcribed and filed under the
          team member&apos;s name; calls nobody picks up go to the AI assistant. Hang-ups and
          robocalls are logged only.
        </p>
      </div>

      {calls.length === 0 ? (
        <p className="text-slate-500 text-sm">No calls yet.</p>
      ) : (
        <div className="space-y-4">
          {calls.map((c) => {
            const child = c.platform === 'twilio' ? children.get(c.platformCallId) : undefined;
            const rec = recordingLink(c, '');
            return (
              <details
                key={c.id}
                id={c.id}
                open={focus === c.id}
                className="bg-white border border-slate-200 rounded-xl"
              >
                <summary className="p-4 cursor-pointer select-none flex flex-wrap gap-3 items-center">
                  <span className="font-medium text-navy-900">{whenCT(c.startedAt ?? c.createdAt)}</span>
                  <span className="text-sm text-slate-700">
                    {formatPhoneDisplay(c.fromNumber) ?? 'Caller ID withheld'}
                  </span>
                  <span className="text-xs text-slate-500">{formatCallDuration(c.durationSec)}</span>
                  <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badge(c.status)}`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                  <span className="inline-block rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-700">
                    {answeredLabel(c)}
                  </span>
                  {child ? (
                    <a href={`#${child.id}`} className="text-xs text-sky-700 hover:underline">
                      AI took it →
                    </a>
                  ) : null}
                  {c.leadId ? (
                    <Link href={`/admin/leads/${c.leadId}`} className="text-xs text-sky-700 hover:underline">
                      Open lead →
                    </Link>
                  ) : null}
                  <span className="text-sm text-slate-600 truncate max-w-xl basis-full sm:basis-auto">
                    {summaryLine(c)}
                  </span>
                </summary>
                <div className="border-t border-slate-100 p-4 space-y-3">
                  {c.summary ? (
                    <p className="text-sm text-slate-800">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">Summary</span>
                      {c.summary}
                    </p>
                  ) : null}
                  {c.extracted?.booking ? (
                    <p className="text-sm text-slate-800">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">Booked</span>
                      {c.extracted.booking}
                    </p>
                  ) : null}
                  {c.extracted?.followUps && c.extracted.followUps.length > 0 ? (
                    <div className="text-sm text-slate-800">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">Follow-ups</span>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {c.extracted.followUps.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {c.extracted?.spam ? (
                    <p className="text-xs text-amber-800">Flagged as spam: {c.extracted.spamReason ?? '—'}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>Ended: {c.endedReason ?? '—'}</span>
                    {c.platform === 'twilio' && c.transcriptionStatus ? (
                      <span>Transcription: {c.transcriptionStatus}</span>
                    ) : null}
                    {rec ? (
                      <a href={rec} target="_blank" rel="noreferrer" className="text-sky-700 hover:underline">
                        Listen to recording ↗
                      </a>
                    ) : null}
                  </div>
                  {c.transcript && c.transcript.length > 0 ? (
                    <div className="space-y-2">
                      {c.transcript.map((t, i) => (
                        <div
                          key={i}
                          className={
                            t.role === 'user'
                              ? 'text-sm bg-sky-50 border border-sky-100 rounded-lg p-3'
                              : 'text-sm bg-slate-50 border border-slate-100 rounded-lg p-3'
                          }
                        >
                          <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-1">
                            {t.role === 'user' ? 'Caller' : staffLabel(c)}
                          </span>
                          <span className="whitespace-pre-wrap">{t.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No transcript.</p>
                  )}
                  {canReprocess(c) ? (
                    <form action={reprocessCallAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="border border-navy-900 text-navy-900 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50"
                      >
                        {c.platform === 'twilio' ? 'Re-transcribe and reprocess' : 'Reprocess call'}
                      </button>
                    </form>
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
