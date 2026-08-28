import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getLeadByContactToken, markContactedByToken } from '@/lib/leads';
import { formatDuration, responseState } from '@/lib/followup';

// One-click "I've reached out" from the owner notification email.
// GET shows the lead and a confirm button; the POST (server action) records the
// touch. Acting on GET would let mail scanners/link previews mark leads for us.
export const dynamic = 'force-dynamic';

async function ackAction(formData: FormData) {
  'use server';
  const token = String(formData.get('token') ?? '');
  if (!token) return;
  await markContactedByToken(token);
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
}

export default async function AckPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token;
  const lead = token ? await getLeadByContactToken(token).catch(() => undefined) : undefined;

  if (!lead) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-2">Link not recognised</h1>
        <p className="text-slate-600">
          This acknowledge link is missing or no longer valid. Open the lead in the{' '}
          <Link href="/admin/leads" className="text-sky-700 hover:underline">admin console</Link>{' '}
          instead.
        </p>
      </Layout>
    );
  }

  const state = responseState(lead);

  if (state.kind === 'responded') {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-2 text-green-800">Marked as contacted</h1>
        <p className="text-slate-700">
          <strong>{lead.name}</strong> was first reached{' '}
          <strong>{formatDuration(state.ms)}</strong> after they came in
          {lead.firstContactedAt ? ` (${new Date(lead.firstContactedAt).toLocaleString()})` : ''}.
        </p>
        <p className="text-slate-500 text-sm mt-4">
          <Link href={`/admin/leads/${lead.id}`} className="text-sky-700 hover:underline">
            Open the lead
          </Link>{' '}
          to add a note or change status.
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-1">Reached out to {lead.name}?</h1>
      <p className="text-slate-600 text-sm mb-4">
        {lead.phone ? <span>{lead.phone} · </span> : null}
        {lead.email}
        {lead.flightInterest ? <span> · {lead.flightInterest}</span> : null}
      </p>
      {state.kind === 'waiting' ? (
        <p className={`text-sm mb-4 ${state.slow ? 'text-red-700' : 'text-slate-600'}`}>
          Waiting {formatDuration(state.ms)} so far.
        </p>
      ) : null}
      <form action={ackAction}>
        <input type="hidden" name="token" value={lead.contactToken} />
        <button
          type="submit"
          className="bg-green-700 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-800 w-full"
        >
          Yes — I&rsquo;ve called or emailed them
        </button>
      </form>
      <p className="text-slate-500 text-xs mt-3">
        This stamps the first-response time on the lead. Nothing is sent to the customer.
      </p>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow border border-slate-200 max-w-lg w-full p-8">
        {children}
        <hr className="my-6 border-slate-200" />
        <p className="text-xs text-slate-500">GoFlyTexas · lead response tracking</p>
      </div>
    </main>
  );
}
