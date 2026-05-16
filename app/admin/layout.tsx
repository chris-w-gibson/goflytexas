import Link from 'next/link';
import type { ReactNode } from 'react';
import { getSessionFromCookies } from '@/lib/auth';
import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  const authConfigured = Boolean(process.env.AUTH_SECRET);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!authConfigured && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-amber-900 text-sm text-center">
          <strong>⚠️ AUTH_SECRET not set.</strong> Sessions will fail. Configure it before deploying.
        </div>
      )}
      <header className="bg-navy-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-lg">GoFlyTexas Admin</Link>
            <nav className="flex gap-4 text-sm text-navy-200">
              <Link href="/admin" className="hover:text-white">Dashboard</Link>
              <Link href="/admin/leads" className="hover:text-white">Leads</Link>
              <Link href="/admin/leads/new" className="hover:text-white">+ Add lead</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm text-navy-200">
            {session ? (
              <>
                <span>
                  Signed in as <strong className="text-white">{session.name || session.email}</strong>
                </span>
                <LogoutButton />
              </>
            ) : (
              <span className="text-amber-300">Break-glass session (no user)</span>
            )}
            <Link href="/" className="hover:text-white">← Site</Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
