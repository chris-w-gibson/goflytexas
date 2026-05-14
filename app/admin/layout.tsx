import Link from 'next/link';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const authConfigured = Boolean(process.env.ADMIN_TOKEN);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!authConfigured && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-amber-900 text-sm text-center">
          <strong>⚠️ Admin is unprotected.</strong> Set <code className="bg-amber-200 px-1 rounded">ADMIN_TOKEN</code> in Railway env vars before exposing publicly.
        </div>
      )}
      <header className="bg-navy-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-lg">GoFlyTexas Admin</Link>
            <nav className="flex gap-4 text-sm text-navy-200">
              <Link href="/admin" className="hover:text-white">Dashboard</Link>
              <Link href="/admin/leads" className="hover:text-white">Leads</Link>
              <Link href="/admin/leads/new" className="hover:text-white">+ Add lead</Link>
            </nav>
          </div>
          <Link href="/" className="text-sm text-navy-200 hover:text-white">← Back to site</Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
