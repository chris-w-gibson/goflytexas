import Link from 'next/link';
import { countLeads, getResponseStats, listLeads } from '@/lib/leads';
import { formatDuration } from '@/lib/followup';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [counts, recent, response] = await Promise.all([
    countLeads(),
    listLeads({ limit: 10 }),
    getResponseStats(),
  ]);

  const waitingColor =
    response.waitingOverHour > 0
      ? 'bg-red-100 text-red-900'
      : response.waiting > 0
        ? 'bg-amber-100 text-amber-900'
        : 'bg-green-100 text-green-900';
  const responseStats = [
    {
      label: 'Awaiting first reply',
      value: String(response.waiting),
      hint: response.waitingOverHour > 0 ? `${response.waitingOverHour} waiting over an hour` : 'nobody waiting over an hour',
      color: waitingColor,
    },
    {
      label: 'Median response (30d)',
      value: response.medianResponseMs === null ? '—' : formatDuration(response.medianResponseMs),
      hint: `${response.responded30d} leads answered by a person`,
      color: 'bg-slate-100 text-slate-900',
    },
    {
      label: 'Answered within 1h',
      value: response.withinHourPct === null ? '—' : `${response.withinHourPct}%`,
      hint: 'goal: every lead, every time',
      color: 'bg-slate-100 text-slate-900',
    },
  ];

  const stats = [
    { label: 'Total', value: counts.total, color: 'bg-slate-100 text-slate-900' },
    { label: 'New', value: counts.new_, color: 'bg-sky-100 text-sky-900' },
    { label: 'Contacted', value: counts.contacted, color: 'bg-amber-100 text-amber-900' },
    { label: 'Converted', value: counts.converted, color: 'bg-green-100 text-green-900' },
    { label: 'Unsubscribed', value: counts.unsubscribed, color: 'bg-slate-200 text-slate-700' },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {responseStats.map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <div className="text-xs uppercase tracking-wide opacity-70">{s.label}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-xs opacity-70 mt-1">{s.hint}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
              <div className="text-xs uppercase tracking-wide opacity-70">{s.label}</div>
              <div className="text-3xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Recent leads</h2>
          <Link href="/admin/leads" className="text-sm text-sky-700 hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
            No leads yet. They'll show up here as soon as someone submits the contact form.
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Interest</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 whitespace-nowrap">When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link href={`/admin/leads/${l.id}`} className="text-sky-700 hover:underline">
                        {l.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{l.email}</td>
                    <td className="px-4 py-2 text-slate-600">{l.flightInterest ?? '—'}</td>
                    <td className="px-4 py-2"><StatusBadge status={l.status} /></td>
                    <td className="px-4 py-2 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-sky-100 text-sky-900',
    contacted: 'bg-amber-100 text-amber-900',
    converted: 'bg-green-100 text-green-900',
    unsubscribed: 'bg-slate-200 text-slate-600',
  };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-slate-100'}`}>
      {status}
    </span>
  );
}
