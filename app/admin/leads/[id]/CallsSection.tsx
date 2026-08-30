import Link from 'next/link';
import { listCallsForLead } from '@/lib/calls';
import { formatCallDuration } from '@/lib/followup';
import { recordingLink } from '@/lib/voice/twilio';

/** Phone calls (AI- or human-answered) linked to this lead, with transcripts inline. */
export async function CallsSection({ leadId }: { leadId: string }) {
  const calls = await listCallsForLead(leadId);
  if (calls.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <h2 className="font-semibold text-navy-900">Phone calls</h2>
      {calls.map((c) => {
        const staff = c.answeredBy === 'human' ? c.answeredByName ?? 'Staff' : 'AI';
        const rec = recordingLink(c, '');
        return (
          <details key={c.id} className="border border-slate-200 rounded-lg" open={calls.length === 1}>
            <summary className="p-3 cursor-pointer select-none text-sm flex flex-wrap gap-3 items-center">
              <span className="font-medium">
                {(c.startedAt ?? c.createdAt).toLocaleString('en-US', {
                  timeZone: 'America/Chicago',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-xs text-slate-500">{formatCallDuration(c.durationSec)}</span>
              <span className="inline-block rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-700">
                answered by {staff}
              </span>
              {rec ? (
                <a href={rec} target="_blank" rel="noreferrer" className="text-xs text-sky-700 hover:underline">
                  Recording ↗
                </a>
              ) : null}
              <Link href={`/admin/calls?focus=${c.id}`} className="text-xs text-sky-700 hover:underline">
                Open in Calls
              </Link>
            </summary>
            <div className="border-t border-slate-100 p-3 space-y-2">
              {c.summary ? <p className="text-sm text-slate-800">{c.summary}</p> : null}
              {(c.transcript ?? []).map((t, i) => (
                <div
                  key={i}
                  className={
                    t.role === 'user'
                      ? 'text-sm bg-sky-50 border border-sky-100 rounded-lg p-2'
                      : 'text-sm bg-slate-50 border border-slate-100 rounded-lg p-2'
                  }
                >
                  <span className="block text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                    {t.role === 'user' ? 'Caller' : staff}
                  </span>
                  <span className="whitespace-pre-wrap">{t.text}</span>
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
