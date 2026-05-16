'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params?.get('token') ?? '';

  const [newPassword, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold mb-2">Missing reset link</h1>
        <p className="text-sm text-slate-600">
          This page must be opened from the reset email link. <Link href="/login/forgot" className="text-sky-700 underline">Request a new one</Link>.
        </p>
      </Shell>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Reset failed');
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
      <p className="text-sm text-slate-600 mb-6">Pick a strong password (8+ characters).</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="new" className="block text-sm font-medium mb-1">New password</label>
          <input
            id="new"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium mb-1">Confirm new password</label>
          <input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-navy-900 text-white font-semibold rounded-lg px-4 py-2 hover:bg-navy-800 disabled:opacity-50"
        >
          {busy ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-md p-8">
        {children}
      </div>
    </main>
  );
}
