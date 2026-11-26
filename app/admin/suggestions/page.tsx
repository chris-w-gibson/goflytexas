import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth';
import { centralShort } from '@/lib/centralTime';
import { drawsInBrowser, KIND_LABEL, parseView, REPLY_MAX } from '@/lib/suggestions/rules';
import { listSuggestions } from '@/lib/suggestions/store';
import { closeSuggestionAction, reopenSuggestionAction } from './actions';
import { SuggestionForm } from './SuggestionForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Suggestions' };

/**
 * Suggestions and bug reports from the team (Jim 11/25). Anyone signed in
 * sends one and sees them all; an admin marks one done with a line on what
 * was done. The break-glass key reads the list and sends nothing.
 */
export default async function SuggestionsPage({ searchParams }: { searchParams: { view?: string | string[] } }) {
  const session = await getSessionFromCookies();
  const view = parseView(searchParams.view);
  const rows = await listSuggestions(view);
  const admin = session?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Suggestions</h1>
        <p className="text-sm text-slate-600 mt-1">
          Something that should work differently, or something that broke. It goes to the person who looks after
          this hub.
        </p>
      </div>

      {session ? (
        <SuggestionForm />
      ) : (
        <p className="text-sm text-slate-500">Sign in with your own account to send one.</p>
      )}

      <div className="flex gap-2 text-sm">
        <Pill label="Open" href="/admin/suggestions" active={view === 'open'} />
        <Pill label="All" href="/admin/suggestions?view=all" active={view === 'all'} />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500" data-testid="suggestions-empty">
          {view === 'open' ? 'Nothing open.' : 'Nothing has been sent yet.'}
        </p>
      ) : (
        <ul className="space-y-3" data-testid="suggestions-list">
          {rows.map((s) => (
            <li key={s.id} className="bg-white border border-slate-200 rounded-xl p-4" data-testid="suggestion-row">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`inline-block rounded px-2 py-0.5 font-medium ${
                    s.kind === 'bug' ? 'bg-red-50 text-red-800' : 'bg-sky-100 text-sky-900'
                  }`}
                >
                  {KIND_LABEL[s.kind]}
                </span>
                <span className="text-slate-500">
                  {s.authorName} · {centralShort(s.createdAt)}
                </span>
                {s.status === 'done' && (
                  <span className="inline-block rounded px-2 py-0.5 font-medium bg-green-50 text-green-800">Done</span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-800 mt-2">{s.body}</p>
              {s.pictureKey &&
                (drawsInBrowser(s.pictureType) ? (
                  <a href={`/admin/suggestions/picture/${s.id}`} target="_blank" rel="noreferrer" className="block mt-3">
                    {/* A signed link from a private bucket: next/image cannot fetch it. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/admin/suggestions/picture/${s.id}`}
                      alt={`Picture sent with this ${KIND_LABEL[s.kind].toLowerCase()}`}
                      loading="lazy"
                      className="max-h-64 rounded-lg border border-slate-200"
                    />
                  </a>
                ) : (
                  <a
                    href={`/admin/suggestions/picture/${s.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-sm text-sky-700 underline"
                  >
                    Open the picture
                  </a>
                ))}
              {s.status === 'done' && (
                <p className="text-sm text-slate-600 mt-3 border-l-2 border-green-200 pl-3" data-testid="suggestion-reply">
                  {s.reply ? <span className="whitespace-pre-wrap">{s.reply}</span> : 'Marked done.'}
                  <span className="block text-xs text-slate-400 mt-1">
                    {s.closedByName}
                    {s.closedAt ? ` · ${centralShort(s.closedAt)}` : ''}
                  </span>
                </p>
              )}
              {admin &&
                (s.status === 'open' ? (
                  <form action={closeSuggestionAction} className="mt-3 flex flex-wrap gap-2 items-end">
                    <input type="hidden" name="id" value={s.id} />
                    <input
                      type="text"
                      name="reply"
                      maxLength={REPLY_MAX}
                      placeholder="What was done (shown to everyone)"
                      aria-label="What was done"
                      className="flex-1 min-w-[12rem] border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Mark done
                    </button>
                  </form>
                ) : (
                  <form action={reopenSuggestionAction} className="mt-3">
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-sm text-sky-700 underline">
                      Open it again
                    </button>
                  </form>
                ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full border ${
        active ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
