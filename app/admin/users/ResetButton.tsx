'use client';

import { useFormStatus } from 'react-dom';

/** Shows that the press was taken while the email goes out. */
export function ResetButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs border border-slate-300 rounded-lg px-2 py-1 hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send password reset'}
    </button>
  );
}
