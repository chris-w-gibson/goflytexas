'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BODY_MAX, PICTURE_ACCEPT } from '@/lib/suggestions/rules';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; text: string };

export function SuggestionForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/admin/suggestions/submit', { method: 'POST', body: new FormData(e.currentTarget) });
      const answer = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !answer?.ok) {
        setState({ kind: 'error', text: answer?.error ?? 'That did not send. Try it again.' });
        return;
      }
      formRef.current?.reset();
      setState({ kind: 'sent' });
      router.refresh();
    } catch {
      setState({ kind: 'error', text: 'That did not send. Check the connection and try it again.' });
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={send}
      data-testid="suggestion-form"
      className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
    >
      <h2 className="font-semibold text-navy-900">Send a suggestion or report a bug</h2>
      <fieldset className="flex gap-4 text-sm">
        <legend className="sr-only">What is it</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="kind" value="suggestion" defaultChecked /> Suggestion
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="kind" value="bug" /> Bug
        </label>
      </fieldset>
      <textarea
        name="body"
        required
        minLength={3}
        maxLength={BODY_MAX}
        rows={4}
        placeholder="What should change, or what went wrong and where"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
      />
      <label className="block text-sm text-slate-600">
        A picture, if it helps (a screenshot or a photo of the screen)
        <input
          type="file"
          name="picture"
          accept={PICTURE_ACCEPT}
          className="block mt-1 text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sky-100 file:text-navy-900"
        />
      </label>
      {state.kind === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {state.text}
        </p>
      )}
      {state.kind === 'sent' && (
        <p data-testid="suggestion-sent" className="text-sm text-emerald-700">
          Sent. It is on the list below.
        </p>
      )}
      <button
        type="submit"
        disabled={state.kind === 'sending'}
        className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50"
      >
        {state.kind === 'sending' ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
