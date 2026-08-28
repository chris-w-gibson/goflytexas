import Link from 'next/link';
import { listCalls } from '@/lib/calls';
import type { Call } from '@/lib/db/schema';
import { formatCallDuration } from '@/lib/followup';
import { formatPhoneDisplay } from '@/lib/voice/phone';
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

function summaryLine(c: Call): string {
  if (c.summary) return c.summary;
  const firstUser = c.transcript?.find((t) => t.role === 'user')?.text;
  if (firstUser) return firstUser;
  if (c.status === 'no_message') return 'No message left';
  return c.status === 'received' ? 'Call in progress or no report yet' : '';
}

export default async function CallsPage({
  searchParams,
}: {
  searchParams?: { focus?: string };
}) {
  const calls = await listCalls({ limit: 100 });
  const focus = searchParams?.focus;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calls</h1>
        <p className="text-sm text-slate-600 mt-1">
          Missed calls answered by the AI phone assistant. Each real conversation becomes a lead;
          hang-ups and robocalls are logged here only.
        </p>
      </div>

      {calls.length === 0 ? (
        <p className="text-slate-500 text-sm">No calls yet.</p>
      ) : (
        <div className="space-y-4">
          {calls.map((c) => (
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
                  {c.status.replace('_', ' ')}
                </span>
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
                {c.extracted?.spam ? (
                  <p className="text-xs text-amber-800">Flagged as spam: {c.extracted.spamReason ?? '—'}</p>
                ) : null}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Ended: {c.endedReason ?? '—'}</span>
                  {c.recordingUrl ? (
                    <a
                      href={c.recordingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-700 hover:underline"
                    >
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
                          {t.role === 'user' ? 'Caller' : 'AI'}
                        </span>
                        <span className="whitespace-pre-wrap">{t.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No transcript.</p>
                )}
                {(c.status === 'failed' || c.status === 'received') && c.rawPayload ? (
                  <form action={reprocessCallAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      className="border border-navy-900 text-navy-900 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50"
                    >
                      Reprocess call
                    </button>
                  </form>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
