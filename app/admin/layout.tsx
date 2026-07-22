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
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          {/* Row 1: brand + user/site links */}
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="font-bold text-base sm:text-lg whitespace-nowrap">
              GoFlyTexas Admin
            </Link>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-navy-200 min-w-0">
              {session ? (
                <>
                  <span className="hidden sm:inline truncate">
                    Signed in as <strong className="text-white">{session.name || session.email}</strong>
                  </span>
                  <span className="sm:hidden truncate text-white">{(session.name || session.email).split(' ')[0]}</span>
                  <LogoutButton />
                </>
              ) : (
                <span className="text-amber-300 text-xs">Break-glass</span>
              )}
              <Link href="/" className="hover:text-white whitespace-nowrap">← Site</Link>
            </div>
          </div>
          {/* Row 2: nav links — own row so they never wrap awkwardly */}
          <nav className="flex gap-4 sm:gap-5 text-sm text-navy-200 mt-2 sm:mt-3 overflow-x-auto -mx-1 px-1">
            <Link href="/admin" className="hover:text-white whitespace-nowrap">Dashboard</Link>
            <Link href="/admin/leads" className="hover:text-white whitespace-nowrap">Leads</Link>
            <Link href="/admin/leads/new" className="hover:text-white whitespace-nowrap">+ Add lead</Link>
            <Link href="/admin/bot-knowledge" className="hover:text-white whitespace-nowrap">Bot Knowledge</Link>
            <Link href="/admin/users" className="hover:text-white whitespace-nowrap">Users</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
