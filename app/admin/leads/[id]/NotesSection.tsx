import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { leadNotes } from '@/lib/db/schema';
import { getSessionFromCookies } from '@/lib/auth';

async function addNoteAction(formData: FormData) {
  'use server';
  const session = await getSessionFromCookies();
  if (!session) throw new Error('Sign in required');
  const leadId = String(formData.get('leadId') ?? '');
  const body = String(formData.get('body') ?? '').trim();
  if (!leadId || !body) return;
  await db.insert(leadNotes).values({
    leadId,
    body: body.slice(0, 4000),
    authorName: session.name ?? session.email ?? 'Staff',
  });
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function NotesSection({ leadId }: { leadId: string }) {
  const notes = await db
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, leadId))
    .orderBy(desc(leadNotes.createdAt));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
      <h2 className="font-semibold text-navy-900">Notes</h2>
      <form action={addNoteAction} className="space-y-2">
        <input type="hidden" name="leadId" value={leadId} />
        <textarea
          name="body"
          required
          rows={2}
          maxLength={4000}
          placeholder='e.g. "Called 8/12 — left voicemail, try again Thursday"'
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-navy-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-navy-800"
        >
          Add note
        </button>
      </form>
      {notes.length === 0 ? (
        <p className="text-sm text-slate-500">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="text-sm border-l-2 border-sky-200 pl-3">
              <p className="whitespace-pre-wrap">{n.body}</p>
              <p className="text-xs text-slate-400 mt-1">
                {n.authorName} ·{' '}
                {n.createdAt.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
