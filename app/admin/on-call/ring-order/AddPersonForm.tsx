'use client';

import { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addPersonAction, type PersonState } from './actions';

const initialState: PersonState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50"
    >
      {pending ? 'Adding…' : 'Add person'}
    </button>
  );
}

export function AddPersonForm() {
  const [state, formAction] = useFormState(addPersonAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-wrap items-end gap-3"
      data-testid="add-person"
    >
      <label className="text-xs text-slate-600">
        Name
        <input
          type="text"
          name="name"
          required
          maxLength={80}
          placeholder="Mark"
          className="mt-1 block border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 w-44"
        />
      </label>
      <label className="text-xs text-slate-600">
        Cell number
        <input
          type="tel"
          name="phone"
          required
          inputMode="tel"
          placeholder="940-555-0101"
          className="mt-1 block border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 w-44"
        />
      </label>
      <SubmitButton />
      {state.error && <p className="basis-full text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="basis-full text-sm text-emerald-700">{state.success}</p>}
    </form>
  );
}
