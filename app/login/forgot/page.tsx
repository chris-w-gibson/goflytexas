'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } finally {
      setSubmitted(true);
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-start sm:items-center justify-center px-4 pt-12 pb-6 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
        <p className="text-sm text-slate-600 mb-6">
          Enter the email on your account. If it matches a user, we&rsquo;ll send a reset link.
        </p>
        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
            If <strong>{email}</strong> matches an account, a reset link is on its way. Check your
            inbox (and spam folder). The link expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-navy-900 text-white font-semibold rounded-lg px-4 py-2 hover:bg-navy-800 disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link href="/login" className="hover:underline">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
