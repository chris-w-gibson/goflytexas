import Link from 'next/link';
import { listLeads, type LeadStatus } from '@/lib/leads';

export const dynamic = 'force-dynamic';

const FILTERS: Array<{ value: LeadStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const raw = searchParams?.status;
  const status =
    raw && (['new', 'contacted', 'converted', 'unsubscribed'] as const).includes(
      raw as LeadStatus,
    )
      ? (raw as LeadStatus)
      : undefined;
  const leads = await listLeads({ status });

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

      <div className="flex gap-2 text-sm">
        {FILTERS.map((f) => {
          const active = (f.value === 'all' && !status) || f.value === status;
          const href = f.value === 'all' ? '/admin/leads' : `/admin/leads?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-3 py-1 rounded-full border ${
                active
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {leads.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
          No leads match this filter.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email / Phone</th>
                <th className="px-4 py-2">Interest</th>
                <th className="px-4 py-2">Source</th>
                <th className="px-4 py-2">Status</th>
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
                    <div className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    <div>{l.email}</div>
                    <div className="text-xs text-slate-500">{l.phone ?? '—'}</div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{l.flightInterest ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-600">{l.source}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badge(l.status)}`}>
                      {l.status}
                    </span>
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

function badge(status: string): string {
  switch (status) {
    case 'new': return 'bg-sky-100 text-sky-900';
    case 'contacted': return 'bg-amber-100 text-amber-900';
    case 'converted': return 'bg-green-100 text-green-900';
    case 'unsubscribed': return 'bg-slate-200 text-slate-600';
    default: return 'bg-slate-100';
  }
}
