import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  markContactedAction,
  updateStatusAction,
} from '@/app/admin/actions';
import { getLeadById } from '@/lib/leads';
import { formatDuration, responseState } from '@/lib/followup';
import { NotesSection } from './NotesSection';
import { CallsSection } from './CallsSection';

export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'contacted', 'converted', 'unsubscribed'] as const;

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLeadById(params.id);
  if (!lead) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/leads" className="text-sky-700 hover:underline text-sm">← Back to leads</Link>
        <h1 className="text-2xl font-bold mt-2">{lead.name}</h1>
        <p className="text-slate-500 text-sm">
          Added {new Date(lead.createdAt).toLocaleString()} via {lead.source}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-3 text-sm">
        <Row label="Email">{lead.email ? <a href={`mailto:${lead.email}`} className="text-sky-700 hover:underline">{lead.email}</a> : <span className="text-slate-400">— (phone only)</span>}</Row>
        <Row label="Phone">{lead.phone ? <a href={`tel:${lead.phone}`} className="text-sky-700 hover:underline">{lead.phone}</a> : '—'}</Row>
        <Row label="Interest">{lead.flightInterest ?? '—'}</Row>
        <Row label="Preferred contact">{lead.preferredContact ?? 'email'}</Row>
        <Row label="Status">
          <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badge(lead.status)}`}>{lead.status}</span>
        </Row>
        <Row label="Unsubscribed">{lead.unsubscribed ? 'Yes' : 'No'}</Row>
        <Row label="First response"><FirstResponse lead={lead} /></Row>
        <Row label="Last contacted">{lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString() : '—'}</Row>
        <div className="pt-3 border-t border-slate-100">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Message</div>
          <div className="whitespace-pre-wrap text-slate-800">{lead.message || <em className="text-slate-400">No message</em>}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold">Actions</h2>

        <form action={markContactedAction} className="flex items-center gap-3">
          <input type="hidden" name="id" value={lead.id} />
          <button
            type="submit"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700"
          >
            Mark contacted (now)
          </button>
          <span className="text-xs text-slate-500">Records that a person reached out: stamps first-response time (once), updates last-contacted, and moves a new lead to contacted.</span>
        </form>

        <form action={updateStatusAction} className="flex items-center gap-3">
          <input type="hidden" name="id" value={lead.id} />
          <label htmlFor="status" className="text-sm font-medium">Set status:</label>
          <select id="status" name="status" defaultValue={lead.status} className="border border-slate-300 rounded px-2 py-1 text-sm">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800"
          >
            Update
          </button>
        </form>
      </div>

      <NotesSection leadId={lead.id} />
      <CallsSection leadId={lead.id} />
    </div>
  );
}

function FirstResponse({ lead }: { lead: NonNullable<Awaited<ReturnType<typeof getLeadById>>> }) {
  const s = responseState(lead);
  if (s.kind === 'responded') {
    return (
      <span className={s.slow ? 'text-amber-700' : 'text-green-700'}>
        {formatDuration(s.ms)} after submission
        {lead.firstContactedAt ? ` (${new Date(lead.firstContactedAt).toLocaleString()})` : ''}
      </span>
    );
  }
  if (s.kind === 'waiting') {
    return <span className={s.slow ? 'text-red-700 font-semibold' : ''}>Waiting {formatDuration(s.ms)} — nobody has reached out yet</span>;
  }
  return <span className="text-slate-400">Not recorded (only automated follow-ups)</span>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 items-baseline">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-800">{children}</div>
    </div>
  );
}

function badge(status: string): string {
  switch (status) {
    case 'new': return 'bg-sky-100 text-sky-900';
    case 'contacted': return 'bg-amber-100 text-amber-900';
    case 'converted': return 'bg-green-100 text-green-900';
    case 'unsubscribed': return 'bg-slate-200 text-slate-600';
    default: return 'bg-slate-100';
  }
}
