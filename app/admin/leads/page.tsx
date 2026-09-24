import Link from 'next/link';
import { attributionLabel } from '@/lib/attribution';
import { listLeads } from '@/lib/leads';
import {
  leadListHref,
  parseLeadListParams,
  PIPELINE_STATUSES,
  subscriptionLabel,
  type LeadListParams,
} from '@/lib/leadFilters';
import { formatDuration, responseState } from '@/lib/followup';

export const dynamic = 'force-dynamic';

const STAGE_LABELS: Record<(typeof PIPELINE_STATUSES)[number], string> = {
  new: 'New',
  contacted: 'Contacted',
  converted: 'Converted',
};

// Jim 2026-09-24 (GFT Hub): a name search box, archive for settled contacts,
// and subscribed/unsubscribed shown apart from the pipeline status.
export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = parseLeadListParams(searchParams);
  const leads = await listLeads({
    status: params.status,
    q: params.q,
    view: params.view,
    subscribed: params.subscribed,
  });
  const deleted = searchParams?.deleted === '1';

  const stageLinks: Array<{ label: string; params: LeadListParams; active: boolean }> = [
    {
      label: 'All',
      params: { ...params, status: undefined, subscribed: undefined },
      active: !params.status && params.subscribed === undefined,
    },
    ...PIPELINE_STATUSES.map((s) => ({
      label: STAGE_LABELS[s],
      params: { ...params, status: s, subscribed: undefined },
      active: params.status === s,
    })),
    {
      label: 'Unsubscribed',
      params: { ...params, status: undefined, subscribed: false },
      active: params.subscribed === false,
    },
  ];
  const viewLinks: Array<{ label: string; params: LeadListParams; active: boolean }> = [
    { label: 'Working list', params: { ...params, view: 'active' }, active: params.view === 'active' },
    { label: 'Archived', params: { ...params, view: 'archived' }, active: params.view === 'archived' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leads</h1>
        <div className="flex gap-2">
          <a
            href="/admin/leads/export"
            className="border border-navy-900 text-navy-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Download CSV
          </a>
          <Link
            href="/admin/leads/new"
            className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800"
          >
            + Add lead manually
          </Link>
        </div>
      </div>

      {deleted ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Lead deleted.
        </div>
      ) : null}

      <form method="get" action="/admin/leads" className="flex gap-2" role="search">
        {params.status ? <input type="hidden" name="status" value={params.status} /> : null}
        {params.view === 'archived' ? <input type="hidden" name="view" value="archived" /> : null}
        {params.subscribed === false ? <input type="hidden" name="subscribed" value="no" /> : null}
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ''}
          placeholder="Search by name, email or phone"
          aria-label="Search leads"
          className="flex-1 max-w-md border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800"
        >
          Search
        </button>
        {params.q ? (
          <Link
            href={leadListHref({ ...params, q: undefined })}
            className="px-3 py-2 text-sm text-slate-600 hover:underline"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {stageLinks.map((f) => (
          <FilterPill key={f.label} label={f.label} href={leadListHref(f.params)} active={f.active} />
        ))}
        <span className="mx-2 text-slate-300">|</span>
        {viewLinks.map((f) => (
          <FilterPill key={f.label} label={f.label} href={leadListHref(f.params)} active={f.active} />
        ))}
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          {params.q ? `No leads match "${params.q}".` : 'No leads match this filter.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email / Phone</th>
                <th className="px-4 py-2">Interest</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Subscribed</th>
                <th className="px-4 py-2">Response</th>
                <th className="px-4 py-2">Last contact</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <Link href={`/admin/leads/${l.id}`} className="text-sky-700 hover:underline font-medium">
                      {l.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {new Date(l.createdAt).toLocaleDateString()}
                      {l.archivedAt ? ' · archived' : ''}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    <div>{l.email ?? <span className="text-slate-400">no email</span>}</div>
                    <div className="text-xs text-slate-500">{l.phone ?? '—'}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{l.flightInterest ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {l.source}
                    {(() => {
                      const ch = attributionLabel(l.attribution as Record<string, string> | null);
                      return ch !== 'Unknown' ? (
                        <span className="block text-xs text-slate-400">{ch}</span>
                      ) : null;
                    })()}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badge(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        l.unsubscribed ? 'bg-slate-200 text-slate-600' : 'bg-green-50 text-green-800'
                      }`}
                    >
                      {subscriptionLabel(l)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <ResponseCell lead={l} />
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {l.lastContactedAt ? new Date(l.lastContactedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full border ${
        active
          ? 'bg-navy-900 text-white border-navy-900'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}

function ResponseCell({ lead }: { lead: (typeof import('@/lib/db/schema'))['leads']['$inferSelect'] }) {
  const s = responseState(lead);
  if (s.kind === 'responded') {
    return (
      <span className={`text-xs font-medium ${s.slow ? 'text-amber-700' : 'text-green-700'}`}>
        {formatDuration(s.ms)}
      </span>
    );
  }
  if (s.kind === 'waiting') {
    return (
      <span className={`text-xs font-semibold ${s.slow ? 'text-red-700' : 'text-slate-700'}`}>
        waiting {formatDuration(s.ms)}
      </span>
    );
  }
  return <span className="text-xs text-slate-400">—</span>;
}

function badge(status: string): string {
  switch (status) {
    case 'new': return 'bg-sky-100 text-sky-900';
    case 'contacted': return 'bg-amber-100 text-amber-900';
    case 'converted': return 'bg-green-100 text-green-900';
    default: return 'bg-slate-100';
  }
}
