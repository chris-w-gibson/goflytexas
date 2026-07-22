'use client';

import { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { inviteUserAction, type InviteState } from './actions';

const initialState: InviteState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50"
    >
      {pending ? 'Sending invite…' : 'Send invite'}
    </button>
  );
}

export function InviteForm() {
  const [state, formAction] = useFormState(inviteUserAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
    >
      <h2 className="font-semibold text-navy-900">Invite a user</h2>
      <p className="text-sm text-slate-600">
        They get an email with a temporary password and must set their own on first
        login.
      </p>
      <div className="grid md:grid-cols-3 gap-3">
        <input
          type="text"
          name="name"
          required
          maxLength={120}
          placeholder="Full name"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="email"
          name="email"
          required
          maxLength={200}
          placeholder="Email"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          name="role"
          defaultValue="staff"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">{state.success}</p>}
      <SubmitButton />
    </form>
  );
}
