'use client';

import { useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { uploadBotDocumentAction, type UploadState } from './actions';

const initialState: UploadState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50"
    >
      {pending ? 'Uploading…' : 'Upload document'}
    </button>
  );
}

export function UploadForm() {
  const [state, formAction] = useFormState(uploadBotDocumentAction, initialState);
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
      <h2 className="font-semibold text-navy-900">Add a document</h2>
      <p className="text-sm text-slate-600">
        Upload a PDF, Word (.docx), .txt, or .md file. The bot answers visitor questions using only
        these documents — public-safe info only.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          placeholder="Title, e.g. Rental rates 2026"
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
          className="text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sky-100 file:text-navy-900"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">{state.success}</p>}
      <SubmitButton />
    </form>
  );
}
