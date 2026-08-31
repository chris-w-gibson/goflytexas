import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addLeadNote, getLeadByContactToken, markContactedByToken } from '@/lib/leads';
import { formatDuration, responseState } from '@/lib/followup';
import { OUTCOME_OPTIONS, composeOutcomeNote } from '@/lib/outcomes';

// "I've reached out" from the owner notification email (Jim 2026-08-31):
// multi-select what actually happened, add a note, say who did it — all of it
// lands on the lead sheet in admin as a note, and the first touch stamps the
// response time. GET only shows the form; the POST records (mail scanners).
export const dynamic = 'force-dynamic';

async function ackAction(formData: FormData) {
  'use server';
  const token = String(formData.get('token') ?? '');
  if (!token) return;
  const author = String(formData.get('author') ?? '').trim() || 'Unknown';
  const outcomes = formData.getAll('outcome').map(String);
  const note = String(formData.get('note') ?? '');
  const lead = await markContactedByToken(token);
  if (lead) {
    await addLeadNote({
      leadId: lead.id,
      authorName: author,
      body: composeOutcomeNote(outcomes, note),
    });
  }
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  redirect(`/ack?token=${encodeURIComponent(token)}&saved=1`);
}

export default async function AckPage({
  searchParams,
}: {
  searchParams?: { token?: string; saved?: string };
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
  const saved = searchParams?.saved === '1';

  return (
    <Layout>
      {saved ? (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          Saved — the note is on the lead sheet in{' '}
          <Link href={`/admin/leads/${lead.id}`} className="underline">admin</Link>.
        </div>
      ) : null}
      <h1 className="text-2xl font-bold mb-1">Reached out to {lead.name}?</h1>
      <p className="text-slate-600 text-sm mb-2">
        {lead.phone ? <span>{lead.phone} · </span> : null}
        {lead.email}
        {lead.flightInterest ? <span> · {lead.flightInterest}</span> : null}
      </p>
      {state.kind === 'responded' ? (
        <p className="text-sm mb-4 text-green-800">
          First reached {formatDuration(state.ms)} after they came in — log any further
          touches below.
        </p>
      ) : state.kind === 'waiting' ? (
        <p className={`text-sm mb-4 ${state.slow ? 'text-red-700' : 'text-slate-600'}`}>
          Came in {formatDuration(state.ms)} ago.
        </p>
      ) : null}
      <form action={ackAction} className="space-y-4">
        <input type="hidden" name="token" value={lead.contactToken} />
        <fieldset>
          <legend className="text-sm font-semibold mb-2">What happened? (pick all that apply)</legend>
          <div className="space-y-2">
            {OUTCOME_OPTIONS.map((o) => (
              <label key={o.id} className="flex items-center gap-2.5 text-sm text-slate-800">
                <input
                  type="checkbox"
                  name="outcome"
                  value={o.id}
                  className="h-4 w-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="ack-note" className="block text-sm font-semibold mb-1">
            Where did it land? <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="ack-note"
            name="note"
            rows={3}
            maxLength={2000}
            placeholder="e.g. Booked a discovery flight for Saturday, wants a call back Tuesday…"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="ack-author" className="block text-sm font-semibold mb-1">
            Your name
          </label>
          <input
            id="ack-author"
            name="author"
            required
            maxLength={80}
            placeholder="So the lead sheet shows who reached out"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-green-700 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-800 w-full"
        >
          Save — I&rsquo;ve reached out
        </button>
      </form>
      <p className="text-slate-500 text-xs mt-3">
        This adds the note to the lead sheet in admin
        {state.kind === 'responded' ? '.' : ' and stamps the first-response time.'} Nothing is
        sent to the customer.
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
        <p className="text-xs text-slate-500">GoFlyTexas · lead follow-through</p>
      </div>
    </main>
  );
}
