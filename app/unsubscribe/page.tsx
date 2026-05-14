import Link from 'next/link';
import { unsubscribeLead } from '@/lib/leads';

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams?: { token?: string };
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

  const lead = await unsubscribeLead(token).catch(() => undefined);

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

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-2 text-green-800">You&rsquo;re unsubscribed</h1>
      <p className="text-slate-700 mb-4">
        We&rsquo;ve removed <strong>{lead.email}</strong> from our follow-up emails. You won&rsquo;t
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

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow border border-slate-200 max-w-lg w-full p-8">
        {children}
        <hr className="my-6 border-slate-200" />
        <p className="text-xs text-slate-500">
          GoFlyTexas · Aero Valley Airport (52F) · 104 Boeing Way · Roanoke, TX 76272
        </p>
      </div>
    </main>
  );
}
