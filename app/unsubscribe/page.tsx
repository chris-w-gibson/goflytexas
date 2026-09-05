import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLeadByUnsubscribeToken, unsubscribeLead } from '@/lib/leads';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

// GET only shows a confirm button; the POST (server action) unsubscribes.
// Corporate link scanners and Gmail prefetch used to unsubscribe leads by
// merely opening the link (audit 2026-09-04, H3).
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams?: { token?: string; done?: string };
}) {
  const token = searchParams?.token;

  if (!token) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-2">Missing link</h1>
        <p className="text-slate-600">
          This unsubscribe link is missing its token. If you got here from one of our emails,
          please click the link directly. Or just reply to our email asking to be removed and
          we&rsquo;ll take care of it.
        </p>
      </Layout>
    );
  }

  const lead = await getLeadByUnsubscribeToken(token).catch(() => undefined);

  if (!lead) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-2">Unsubscribe link invalid</h1>
        <p className="text-slate-600">
          We couldn&rsquo;t find that subscription. It may have already been removed.
          If you keep getting emails, reply to one and we&rsquo;ll handle it manually.
        </p>
      </Layout>
    );
  }

  if (searchParams?.done === '1' || lead.unsubscribed) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-2 text-green-800">You&rsquo;re unsubscribed</h1>
        <p className="text-slate-700 mb-4">
          We&rsquo;ve removed <strong>{lead.email ?? 'your address'}</strong> from our follow-up emails. You won&rsquo;t
          hear from us again unless you reach out first.
        </p>
        <p className="text-slate-500 text-sm">
          Changed your mind? Just{' '}
          <Link href="/contact" className="text-sky-700 hover:underline">send us a new message</Link>{' '}
          anytime.
        </p>
      </Layout>
    );
  }

  async function confirm() {
    'use server';
    await unsubscribeLead(token!).catch(() => undefined);
    redirect(`/unsubscribe?token=${encodeURIComponent(token!)}&done=1`);
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-2">Unsubscribe from GoFlyTexas emails?</h1>
      <p className="text-slate-700 mb-6">
        This stops follow-up emails to <strong>{lead.email ?? 'your address'}</strong>. You can always reach
        us again through the contact page.
      </p>
      <form action={confirm}>
        <button
          type="submit"
          className="inline-block bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-lg font-semibold"
        >
          Yes, unsubscribe me
        </button>
      </form>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow border border-slate-200 max-w-lg w-full p-8">
        {children}
      </div>
    </main>
  );
}
